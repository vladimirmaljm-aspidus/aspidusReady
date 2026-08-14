-- 025_cron_token_security.sql
-- ============================================================================
-- F-8 (Infra P1) — Move CRON_TOKEN out of URL query strings into the
-- `Authorization: Bearer <token>` header, and schedule the previously
-- unscheduled invoice-overdue cron job.
--
-- BACKGROUND
--   The audit (P1) found that CRON_TOKEN was hardcoded as a URL query
--   parameter in cron.job.command for both `subscription-sweep-hourly` and
--   `webhook-retry`. URL query parameters leak via:
--     • Render nginx access logs
--     • Postgres `cron.job.command` (visible to anyone with SELECT on cron.job)
--     • Browser history (if a URL is ever copy-pasted into a browser)
--     • pg_stat_activity (visible query text during execution)
--
--   Additionally, `process.env.CRON_TOKEN` was NOT set on Render — meaning
--   the existing cron jobs were silently failing auth (returning 401) and
--   pg_cron's "succeeded" status was masking the actual API failure.
--
--   This migration:
--   1. Unschedules the existing jobs (which used `?token=...` in URL).
--   2. Reschedules them with the token in the `Authorization` header.
--   3. Schedules the previously-unscheduled `invoice-overdue-check` job.
--
--   CRON_TOKEN is now stored as a Render env var (set via PUT
--   /v1/services/{id}/env-vars/CRON_TOKEN). It is NOT stored in this SQL
--   file (the value below is a placeholder; the live DB has the real value).
--
-- CRON ROUTES
--   All three cron routes (webhook-retry, subscription-sweep, invoice-overdue)
--   have been updated in src/app/api/cron/*/route.ts to accept BOTH:
--     • Authorization: Bearer <token> header  (preferred — F-8)
--     • ?token=... URL query                  (legacy backward compat)
--   so a rolling deploy won't break cron jobs that haven't been re-scheduled
--   yet.
--
-- IDEMPOTENT
--   All cron.unschedule calls are guarded by `WHERE EXISTS` checks so the
--   migration can be re-run safely. cron.schedule returns an error if a
--   job with the same name already exists, so we unschedule before each
--   schedule call.
-- ============================================================================

-- ─── 1. subscription-sweep-hourly — token moved URL→header ────────────────
SELECT cron.unschedule('subscription-sweep-hourly')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'subscription-sweep-hourly');

SELECT cron.schedule(
  'subscription-sweep-hourly',
  '15 * * * *',  -- every hour at minute 15
  $cmd$
    SELECT net.http_get(
      url := 'https://aspidus.onrender.com/api/cron/subscription-sweep',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer <CRON_TOKEN>'
      )
    )
  $cmd$
);

-- ─── 2. webhook-retry — token moved URL→header ────────────────────────────
SELECT cron.unschedule('webhook-retry')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'webhook-retry');

SELECT cron.schedule(
  'webhook-retry',
  '*/5 * * * *',  -- every 5 minutes
  $cmd$
    SELECT net.http_get(
      url := 'https://aspidus.onrender.com/api/cron/webhook-retry',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer <CRON_TOKEN>'
      )
    )
  $cmd$
);

-- ─── 3. invoice-overdue-check — NEW schedule (was never scheduled) ────────
--   The /api/cron/invoice-overdue/route.ts handler existed but had no
--   pg_cron job calling it. Invoices that passed their due_date stayed in
--   "sent"/"viewed" status forever — no overdue transition, no notification.
SELECT cron.unschedule('invoice-overdue-check')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'invoice-overdue-check');

SELECT cron.schedule(
  'invoice-overdue-check',
  '0 9 * * *',  -- daily at 09:00 UTC
  $cmd$
    SELECT net.http_get(
      url := 'https://aspidus.onrender.com/api/cron/invoice-overdue',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer <CRON_TOKEN>'
      )
    )
  $cmd$
);

-- ─── 4. Verify all 3 HTTP-based cron jobs are scheduled ───────────────────
--   Non-HTTP jobs (session-cleanup, password-reset-cleanup, vacuum-*) are
--   unchanged — they don't make outbound HTTP calls so the CRON_TOKEN
--   security fix doesn't apply to them.
SELECT jobname, schedule, active
  FROM cron.job
  WHERE command LIKE '%net.http_get%'
  ORDER BY jobname;

-- ─── 5. NOTE on token storage ─────────────────────────────────────────────
--   The placeholder `<CRON_TOKEN>` strings above are intentionally NOT the
--   real value — the live DB has the actual token (set via this migration
--   applied with `sed -e 's|<CRON_TOKEN>|0ray_lpaQYf6pV3G1Tw_8o0xNZt-...|g'`
--   or by manually re-scheduling with the real value). This keeps the
--   token out of:
--     • Git history (this file is committed)
--     • GitHub search / code scanning
--     • Anyone who clones the repo but doesn't have Render/Supabase access
--
--   To rotate the token in the future:
--     1. Generate a new token: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
--     2. PUT it to Render: curl -X PUT https://api.render.com/v1/services/$SERVICE_ID/env-vars/CRON_TOKEN -d '{"value":"<NEW_TOKEN>"}'
--     3. Re-run this migration with the new token substituted.
--     4. Trigger a Render deploy so the new env var takes effect.
-- ============================================================================

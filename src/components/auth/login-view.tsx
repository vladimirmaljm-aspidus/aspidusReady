"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";

export function LoginView() {
  const setUser = useAppStore((s) => s.setUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed. Please try again.");
        return;
      }
      setUser(data.user);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const highlights = [
    {
      icon: Globe,
      text: "Multi-tenant workspace isolation",
    },
    {
      icon: TrendingUp,
      text: "Landed cost & margin engine",
    },
    {
      icon: ShieldCheck,
      text: "KYC compliance & document verification",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT — BRANDING PANEL (gradient)
          On mobile: compact header strip (logo only) so the login form is
          reachable without scrolling — the full marketing copy only makes
          sense once there's room for a two-column layout.
          On desktop (lg+): full-height left panel with headline/pills.
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0f766e] via-[#0d6b64] to-[#064e3b] px-6 py-6 lg:w-[52%] lg:min-h-screen lg:px-16 lg:py-20 lg:justify-center xl:px-24">
        {/* Decorative background elements — desktop only, mobile strip is too short for these to read */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {/* Large soft glow */}
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#14b8a6]/20 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-[#0d9488]/15 blur-[100px]" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          {/* Floating circles */}
          <div className="absolute top-1/4 right-1/3 h-64 w-64 rounded-full border border-white/[0.06]" />
          <div className="absolute bottom-1/3 left-1/4 h-40 w-40 rounded-full border border-white/[0.04]" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-lg animate-fade-in">
          {/* Logo — always visible, compact on mobile */}
          <div className="animate-slide-up lg:mb-12">
            <div className="inline-flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 lg:size-12">
                <span className="text-base font-bold text-white lg:text-2xl">
                  A
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white lg:text-3xl">
                  Aspidus Trade
                </h1>
                <p className="hidden text-sm text-teal-200/70 lg:block lg:text-base">
                  Trade Management Platform
                </p>
              </div>
            </div>
          </div>

          {/* Headline, tagline, highlight pills, footer — desktop only.
              On mobile these push the login form off-screen, so they're
              hidden below lg and the form takes over as the primary content. */}
          <div className="hidden lg:block">
            <h2 className="mb-4 mt-12 text-3xl font-bold leading-tight tracking-tight text-white animate-slide-up lg:text-5xl lg:leading-[1.1]" style={{ animationDelay: "80ms" }}>
              International trade,
              <br />
              <span className="text-teal-200">managed end to end.</span>
            </h2>

            <p className="mb-10 max-w-md text-base leading-relaxed text-teal-100/60 animate-slide-up lg:mb-14 lg:text-lg" style={{ animationDelay: "160ms" }}>
              Streamline your global trade operations with powerful CRM, landed
              cost calculations, and compliance workflows.
            </p>

            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "240ms" }}>
              {highlights.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-4 py-3 ring-1 ring-white/[0.08] backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.1]"
                  >
                    <Icon className="size-5 shrink-0 text-teal-300" />
                    <span className="text-sm font-medium text-teal-50/90">
                      {h.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-12 text-xs text-teal-200/30 animate-slide-up lg:mt-16" style={{ animationDelay: "320ms" }}>
              © {new Date().getFullYear()} Aspidus. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT — LOGIN FORM
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-8 lg:min-h-screen lg:px-12 lg:py-12">
        <div className="w-full max-w-[420px] animate-fade-in">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="mb-2 space-y-2 px-0 text-left">
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                Welcome back
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to access your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              {/* Error alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 animate-scale-in"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertDescription className="text-sm font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={submit} className="space-y-5" noValidate>
                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="login-username"
                    className="text-sm font-medium text-foreground/80"
                  >
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors duration-200 group-focus-within:text-[#0f766e]" />
                    <Input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your username"
                      disabled={loading}
                      aria-required="true"
                      aria-label="Username"
                      className="h-12 rounded-xl border-border/60 bg-background/80 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/40 transition-all duration-200 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/12 focus:bg-background"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium text-foreground/80"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors duration-200 group-focus-within:text-[#0f766e]" />
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your password"
                      disabled={loading}
                      aria-required="true"
                      aria-label="Password"
                      className="h-12 rounded-xl border-border/60 bg-background/80 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/40 transition-all duration-200 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/12 focus:bg-background"
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="relative h-12 w-full rounded-xl bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-[#0d6b64] hover:to-[#0f766e] hover:shadow-lg hover:shadow-[#0f766e]/20 hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0f766e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-md"
                  disabled={loading}
                  aria-label="Sign in to your account"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Bottom note */}
              <p className="mt-8 text-center text-xs text-muted-foreground/50">
                Secure login · Your data is encrypted end-to-end
              </p>
              {/* Copyright — shown here on mobile only; the desktop branding
                  panel already has its own copyright line. */}
              <p className="mt-4 text-center text-[11px] text-muted-foreground/40 lg:hidden">
                © {new Date().getFullYear()} Aspidus. All rights reserved.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

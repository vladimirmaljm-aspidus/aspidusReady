"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  FileText,
  Download,
  BookOpen,
  Receipt,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

const FIRM_NAME = "Aspidus";

export function PortalLogin() {
  const setPortalAccess = useAppStore((s) => s.setPortalAccess);
  const setAppMode = useAppStore((s) => s.setAppMode);
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Setup-password dialog state
  const [setupOpen, setSetupOpen] = useState(false);
  const [accessId, setAccessId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Reset password state
  const [resetToken, setResetToken] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Pre-fill email from URL params + check for reset token
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
    const accessIdParam = searchParams.get("access_id");
    if (accessIdParam) {
      setAccessId(accessIdParam);
      setSetupOpen(true);
    }
    const resetTokenParam = searchParams.get("reset_token");
    if (resetTokenParam) {
      setResetToken(resetTokenParam);
      setNewPassword(""); // clear for new entry
    }
  }, [searchParams]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotResult(null);
    try {
      const res = await fetch("/api/portal/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotResult({ ok: true, message: data.message || "Reset link sent." });
    } catch {
      setForgotResult({ ok: false, message: "Network error. Please try again." });
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetToken || !newPassword) return;
    if (newPassword.length < 8) {
      setResetResult({ ok: false, message: "Password must be at least 8 characters." });
      return;
    }
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await fetch("/api/portal/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetResult({ ok: true, message: data.message || "Password reset successfully!" });
        setTimeout(() => {
          setResetToken("");
          window.history.replaceState({}, "", "/portal/login");
        }, 2000);
      } else {
        setResetResult({ ok: false, message: data.error || "Reset failed." });
      }
    } catch {
      setResetResult({ ok: false, message: "Network error. Please try again." });
    } finally {
      setResetLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Sign in failed.");
        return;
      }
      setPortalAccess(data.access);
      setAppMode("portal");
      toast.success("Welcome to your client portal.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function setupPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!accessId || !newPassword) return;
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSetupLoading(true);
    try {
      const res = await fetch("/api/portal/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_id: accessId, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Password setup failed.");
        return;
      }
      toast.success("Password set. You can now sign in.");
      setSetupOpen(false);
      setAccessId("");
      setNewPassword("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — login form with mesh background */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-mesh-portal relative">
        <div className="w-full max-w-md relative z-10">
          {/* Brand — client portal mark with emerald accent */}
          <div className="flex items-center gap-3 mb-10">
            <div className="size-12 rounded-xl bg-gradient-emerald text-primary-foreground flex items-center justify-center font-semibold text-lg tracking-tight shadow-soft-md">
              A
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Client Portal</h1>
              <p className="text-sm text-muted-foreground">{FIRM_NAME}</p>
            </div>
          </div>

          {/* Card with animated gradient border */}
          <div className="border-gradient shadow-soft-lg">
            <div className="bg-card rounded-[calc(var(--radius-xl)-1px)] p-7 sm:p-8">
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your offers, documents, and catalog.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
                      placeholder="you@company.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 smooth focus-visible:ring-primary/40 focus-visible:border-primary/40"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium shadow-soft hover:shadow-soft-md smooth"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>

                <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="block mx-auto text-xs text-muted-foreground hover:text-primary underline underline-offset-4 smooth"
                    >
                      First time? Set up your password
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="size-4 text-primary" />
                        Set up your password
                      </DialogTitle>
                      <DialogDescription>
                        Enter the access ID from your invitation email and choose a
                        password (at least 8 characters).
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={setupPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="access_id">Access ID</Label>
                        <Input
                          id="access_id"
                          value={accessId}
                          onChange={(e) => setAccessId(e.target.value)}
                          placeholder="pa_..."
                          disabled={setupLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={setupLoading}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSetupOpen(false)}
                          disabled={setupLoading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={setupLoading}>
                          {setupLoading ? (
                            <Loader2 className="size-4 animate-spin mr-1" />
                          ) : null}
                          Set password
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </form>

              {/* Forgot password link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 smooth"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Forgot password dialog */}
              <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <KeyRound className="size-4 text-primary" />
                      Reset Your Password
                    </DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                        disabled={forgotLoading}
                        required
                      />
                    </div>
                    {forgotResult && (
                      <div className={`p-3 rounded-lg text-sm ${forgotResult.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-destructive/10 text-destructive"}`}>
                        {forgotResult.message}
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>Close</Button>
                      <Button type="submit" disabled={forgotLoading || !forgotEmail}>
                        {forgotLoading ? <Loader2 className="size-4 animate-spin" /> : "Send Reset Link"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Reset password dialog (triggered by URL param) */}
              <Dialog open={!!resetToken} onOpenChange={(o) => { if (!o) { setResetToken(""); window.history.replaceState({}, "", "/portal/login"); } }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <KeyRound className="size-4 text-primary" />
                      Set New Password
                    </DialogTitle>
                    <DialogDescription>
                      Enter your new password (minimum 8 characters).
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password-reset">New password</Label>
                      <Input
                        id="new-password-reset"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={resetLoading}
                        required
                        minLength={8}
                      />
                    </div>
                    {resetResult && (
                      <div className={`p-3 rounded-lg text-sm ${resetResult.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-destructive/10 text-destructive"}`}>
                        {resetResult.message}
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="submit" disabled={resetLoading || !newPassword}>
                        {resetLoading ? <Loader2 className="size-4 animate-spin" /> : "Set New Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} {FIRM_NAME} · Secure client workspace
          </p>
        </div>
      </div>

      {/* Right — emerald gradient welcome panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-emerald relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Floating accent shapes */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-white/[0.08] blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/[0.06] blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 max-w-2xl text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-medium w-fit mb-8 backdrop-blur-sm">
            <ShieldCheck className="size-3.5" />
            Encrypted client workspace
          </div>

          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight mb-5 leading-[1.1]">
            Welcome to your
            <br />
            <span className="text-white/90">client portal.</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-12 max-w-md">
            Everything you need to collaborate with {FIRM_NAME} — your offers,
            documents, and product catalog, all in one beautifully organized
            place.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: FileText,
                title: "View your offers",
                desc: "Track every proposal, its status, and line items in real time.",
              },
              {
                icon: Download,
                title: "Download documents",
                desc: "Contracts, specifications, and invoices — always at hand.",
              },
              {
                icon: BookOpen,
                title: "Browse product catalog",
                desc: "Explore our products with full specifications and origins.",
              },
              {
                icon: Receipt,
                title: "Track invoices",
                desc: "Stay on top of billing with transparent, itemized records.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4 group">
                  <div className="size-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm smooth group-hover:bg-white/15">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm">{f.title}</p>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-white/15 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="size-3.5" />
            <span>Bank-grade security · SOC 2 compliant · GDPR ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

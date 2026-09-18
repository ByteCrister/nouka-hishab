"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, UserPlus, KeyRound, ArrowLeft, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { signIn } from "next-auth/react";
import axios from "axios";
import { otpService } from "@/utils/services/otp-service";
import { OTP_TYPES } from "@/constants/common.const";

// ─── Wavy SVG Decorations ───────────────────────────────────────────────────
const TopWave = () => (
  <svg
    className="absolute top-0 left-0 w-full pointer-events-none select-none"
    viewBox="0 0 400 110"
    preserveAspectRatio="none"
    style={{ height: "110px" }}
  >
    <defs>
      <linearGradient id="waveGradientTop" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0B5D3B" stopOpacity="0.90" />
        <stop offset="55%" stopColor="#12784B" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#C23B32" stopOpacity="0.80" />
      </linearGradient>
    </defs>
    <path
      d="M0,60 C60,100 120,20 200,55 C280,90 340,10 400,45 L400,0 L0,0 Z"
      fill="url(#waveGradientTop)"
    />
    <path
      d="M0,80 C80,40 160,95 240,60 C320,25 370,80 400,65 L400,0 L0,0 Z"
      fill="white"
      fillOpacity="0.12"
    />
  </svg>
);

const BottomWave = () => (
  <svg
    className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
    viewBox="0 0 400 60"
    preserveAspectRatio="none"
    style={{ height: "60px" }}
  >
    <defs>
      <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C23B32" stopOpacity="0.20" />
        <stop offset="100%" stopColor="#0B5D3B" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <path
      d="M0,30 C80,5 160,55 240,25 C320,-5 370,45 400,20 L400,60 L0,60 Z"
      fill="url(#waveGradientBottom)"
    />
  </svg>
);

// ─── Google Icon ─────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── Schemas ─────────────────────────────────────────────────────────────────
type AuthMode = "signin" | "forgot" | "signup-details" | "signup-otp" | "signup-password";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});
const detailsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});
const passwordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

// ─── Mode Meta ────────────────────────────────────────────────────────────────
const modeIcon: Record<AuthMode, React.ReactNode> = {
  signin: <LogIn className="w-5 h-5" />,
  forgot: <KeyRound className="w-5 h-5" />,
  "signup-details": <UserPlus className="w-5 h-5" />,
  "signup-otp": <ShieldCheck className="w-5 h-5" />,
  "signup-password": <Lock className="w-5 h-5" />,
};

// ─── Styled Input ─────────────────────────────────────────────────────────────
function AuthInput({
  id, type = "text", placeholder, icon, value, onChange, hasError, maxLength,
}: {
  id: string; type?: string; placeholder: string;
  icon: React.ReactNode; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean; maxLength?: number;
}) {
  return (
    <div className="relative group">
      <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200
        ${hasError ? "text-sindoor-500" : "text-river-300 group-focus-within:text-river-500"}`}>
        {icon}
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`pl-10 h-12 rounded-xl border text-ink-700 bg-river-50/70 placeholder:text-ink-500/50
          focus-visible:ring-2 focus-visible:ring-river-400 focus-visible:ring-offset-0
          transition-all duration-200 font-sans text-sm
          ${hasError
            ? "border-sindoor-400 bg-sindoor-50/50 focus-visible:ring-sindoor-300"
            : "border-river-100 hover:border-river-200 focus-visible:border-river-400"
          }`}
      />
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
export function SignInDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", otp: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "AccountNotFound") {
        toast.error("Account not found. Please sign up first.");
        window.history.replaceState(null, "", window.location.pathname);
      } else if (params.get("error") === "AccountBlocked") {
        toast.error("Your account has been blocked.");
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) {
      setErrors(prev => { const n = { ...prev }; delete n[e.target.id]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "signin") {
      const result = signinSchema.safeParse(formData);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach(i => { if (i.path[0] !== undefined) newErrors[String(i.path[0])] = i.message; });
        setErrors(newErrors);
        return;
      }
      setIsLoading(true);
      try {
        await axios.post("/api/auth/verify", { email: formData.email, password: formData.password, provider: "credentials" });
        const result = await signIn("credentials", { redirect: false, email: formData.email, password: formData.password });
        if (result?.error) {
          toast.error("Invalid email or password");
          setErrors({ email: "Invalid credentials", password: " " });
        } else {
          toast.success("Signed in successfully");
          setOpen(false);
          window.location.reload();
        }
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
        toast.error(message || "Authentication failed");
        if (axios.isAxiosError(error) && error.response?.status === 401) setErrors({ email: "Invalid credentials", password: " " });
      } finally { setIsLoading(false); }

    } else if (mode === "forgot") {
      const result = forgotSchema.safeParse(formData);
      if (!result.success) {
        setErrors({ email: result.error.issues[0].message });
        return;
      }
      setIsLoading(true);
      try {
        await otpService.sendOtp(formData.email, OTP_TYPES.USER_FORGOT_PASSWORD);
        toast.success("Password reset code sent to your email");
        setMode("signin");
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
        toast.error(message || "Failed to send reset code");
      } finally { setIsLoading(false); }

    } else if (mode === "signup-details") {
      const result = detailsSchema.safeParse(formData);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach(i => { if (i.path[0] !== undefined) newErrors[String(i.path[0])] = i.message; });
        setErrors(newErrors); return;
      }
      setIsLoading(true);
      try {
        const checkRes = await axios.post("/api/auth/check-email", { email: formData.email });
        if (checkRes.data?.data?.exists) {
          toast.error("Email is already registered. Please sign in.");
          setMode("signin"); setIsLoading(false); return;
        }
        await otpService.sendOtp(formData.email, OTP_TYPES.EMAIL_VERIFICATION);
        toast.success("Verification code sent to your email");
        setMode("signup-otp");
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
        toast.error(message || "Failed to process request");
      } finally { setIsLoading(false); }

    } else if (mode === "signup-otp") {
      const result = otpSchema.safeParse(formData);
      if (!result.success) { setErrors({ otp: result.error.issues[0].message }); return; }
      setIsLoading(true);
      try {
        await otpService.verifyOtp(formData.email, formData.otp, OTP_TYPES.EMAIL_VERIFICATION);
        toast.success("Email verified successfully");
        setMode("signup-password");
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
        setErrors({ otp: message || "Invalid OTP" });
      } finally { setIsLoading(false); }

    } else if (mode === "signup-password") {
      const result = passwordSchema.safeParse(formData);
      if (!result.success) { setErrors({ password: result.error.issues[0].message }); return; }
      setIsLoading(true);
      try {
        await axios.post("/api/auth/register", { fullName: formData.fullName, email: formData.email, password: formData.password });
        const signInResult = await signIn("credentials", { redirect: false, email: formData.email, password: formData.password });
        if (signInResult?.error) {
          toast.error("Account created, but auto-login failed. Please sign in manually.");
          setMode("signin");
        } else {
          toast.success("Account created successfully. Welcome!");
          setOpen(false);
          window.location.reload();
        }
      } catch (error) {
        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
        toast.error(message || "Failed to create account");
      } finally { setIsLoading(false); }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => { setMode("signin"); setFormData({ fullName: "", email: "", password: "", otp: "" }); setErrors({}); }, 300);
    }
  };

  const titles: Record<AuthMode, string> = {
    signin: t("signInTitle"),
    forgot: t("forgotPasswordTitle"),
    "signup-details": t("signUpTitle"),
    "signup-otp": t("otpTitle") || "Verify your email",
    "signup-password": t("signUpTitle"),
  };
  const subtitles: Record<AuthMode, string> = {
    signin: t("signInSubtitle"),
    forgot: t("forgotPasswordSubtitle"),
    "signup-details": t("signUpSubtitle"),
    "signup-otp": t("otpSubtitle") || "Enter the 6-digit code sent to your email",
    "signup-password": t("passwordRequirements") || "Create a secure password",
  };
  const submitLabels: Record<AuthMode, string> = {
    signin: t("signInButton"),
    forgot: t("sendResetLink"),
    "signup-details": t("continueButton"),
    "signup-otp": t("verifyOtpButton"),
    "signup-password": t("createAccountButton"),
  };

  const slide: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
  };

  const showGoogleAndDivider = mode === "signin" || mode === "signup-details";
  const showBack = mode === "forgot" || mode === "signup-otp" || mode === "signup-password";
  const backTarget: Partial<Record<AuthMode, AuthMode>> = {
    forgot: "signin",
    "signup-otp": "signup-details",
    "signup-password": "signup-otp",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-3xl bg-white shadow-[0_32px_80px_-12px_rgba(11,93,59,0.18),0_8px_32px_-8px_rgba(11,93,59,0.12)]">

        {/* Top wave decoration */}
        <div className="relative h-[110px] shrink-0">
          <div className="absolute inset-0 overflow-hidden">
            <TopWave />
          </div>
          {/* Floating icon badge */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10
            w-14 h-14 rounded-2xl bg-white shadow-[0_8px_24px_-4px_rgba(11,93,59,0.25)]
            flex items-center justify-center border border-river-100">
            <motion.div
              key={mode}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-river-500 to-river-700 flex items-center justify-center text-white"
            >
              {modeIcon[mode]}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <motion.div layout className="relative z-10 px-6 pt-10 pb-2">

          {/* Header */}
          <motion.div layout="position" className="text-center mb-6">
            <DialogTitle className="font-display text-2xl font-bold text-ink-700 tracking-tight">
              {titles[mode]}
            </DialogTitle>
            <DialogDescription className="text-ink-500/70 text-sm mt-1.5 leading-relaxed">
              {subtitles[mode]}
            </DialogDescription>
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              variants={slide}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* ── signin / forgot / signup-details fields ── */}
              {(mode === "signin" || mode === "forgot" || mode === "signup-details") && (
                <div className="space-y-3">
                  {mode === "signup-details" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-ink-600 text-sm font-semibold">{t("fullNameLabel")}</Label>
                      <AuthInput id="fullName" type="text" placeholder={t("fullNamePlaceholder")}
                        icon={<User className="w-4 h-4" />} value={formData.fullName}
                        onChange={handleInputChange} hasError={!!errors.fullName} />
                      {errors.fullName && <p className="text-xs text-sindoor-500 mt-1">⚠ {errors.fullName}</p>}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-ink-600 text-sm font-semibold">{t("emailLabel")}</Label>
                    <AuthInput id="email" type="email" placeholder={t("emailPlaceholder")}
                      icon={<Mail className="w-4 h-4" />} value={formData.email}
                      onChange={handleInputChange} hasError={!!errors.email} />
                    {errors.email && <p className="text-xs text-sindoor-500 mt-1">⚠ {errors.email}</p>}
                  </div>

                  {mode === "signin" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-ink-600 text-sm font-semibold">{t("passwordLabel")}</Label>
                        <button type="button" onClick={() => setMode("forgot")}
                          className="text-xs font-semibold text-sindoor-500 hover:text-sindoor-700 transition-colors">
                          {t("forgotPassword")}
                        </button>
                      </div>
                      <AuthInput id="password" type="password" placeholder={t("passwordPlaceholder")}
                        icon={<Lock className="w-4 h-4" />} value={formData.password}
                        onChange={handleInputChange} hasError={!!errors.password} />
                      {errors.password && <p className="text-xs text-sindoor-500 mt-1">⚠ {errors.password}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ── OTP field ── */}
              {mode === "signup-otp" && (
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-ink-600 text-sm font-semibold">{t("otpLabel")}</Label>
                  <AuthInput id="otp" type="text" placeholder={t("otpPlaceholder")}
                    icon={<ShieldCheck className="w-4 h-4" />} value={formData.otp}
                    onChange={handleInputChange} hasError={!!errors.otp} maxLength={6} />
                  {errors.otp && <p className="text-xs text-sindoor-500 mt-1">⚠ {errors.otp}</p>}
                </div>
              )}

              {/* ── Password creation field ── */}
              {mode === "signup-password" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-ink-600 text-sm font-semibold">{t("passwordLabel")}</Label>
                  <AuthInput id="password" type="password" placeholder={t("passwordPlaceholder")}
                    icon={<Lock className="w-4 h-4" />} value={formData.password}
                    onChange={handleInputChange} hasError={!!errors.password} />
                  {errors.password && <p className="text-xs text-sindoor-500 mt-1">⚠ {errors.password}</p>}
                </div>
              )}

              {/* ── Primary CTA ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-sm text-white mt-1
                  bg-gradient-to-r from-river-500 to-river-600
                  hover:from-river-600 hover:to-river-700
                  shadow-[0_6px_20px_-4px_rgba(11,93,59,0.5)]
                  hover:shadow-[0_8px_24px_-4px_rgba(11,93,59,0.6)]
                  active:scale-[0.98] transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                  flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Please wait...
                  </span>
                ) : submitLabels[mode]}
              </button>

              {/* ── Google divider ── */}
              {showGoogleAndDivider && (
                <>
                  <div className="flex items-center gap-3 my-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-river-100 to-river-100" />
                    <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">{t("orContinueWith")}</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-river-100 to-river-100" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await axios.post("/api/auth/verify", { provider: "google" });
                        signIn("google", { callbackUrl: "/" });
                      } catch (error) {
                        setIsLoading(false);
                        const message = axios.isAxiosError(error) ? error.response?.data?.error : null;
                        toast.error(message || "Authentication failed");
                      }
                    }}
                    className="w-full h-11 rounded-xl border border-river-100 bg-white hover:bg-river-50/80
                      text-ink-600 font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
                  >
                    <GoogleIcon />
                    {t("googleSignIn")}
                  </Button>
                </>
              )}

              {/* ── Footer nav ── */}
              <div className="text-center py-3 text-sm text-ink-400">
                {showBack ? (
                  <button type="button" onClick={() => setMode(backTarget[mode] as AuthMode)}
                    className="inline-flex items-center justify-center gap-1.5 font-semibold
                      text-river-500 hover:text-river-700 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {mode === "forgot" ? t("backToSignIn") : "Back"}
                  </button>
                ) : (
                  <>
                    {mode === "signup-details" ? t("haveAccount") : t("noAccount")}{" "}
                    <button type="button"
                      onClick={() => { setMode(mode === "signin" ? "signup-details" : "signin"); setErrors({}); }}
                      className="font-bold text-river-500 hover:text-river-700 transition-colors ml-1">
                      {mode === "signup-details" ? t("signInLink") : t("signUpLink")}
                    </button>
                  </>
                )}
              </div>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* Bottom wave */}
        <div className="relative h-[60px] overflow-hidden mt-1 shrink-0">
          <BottomWave />
        </div>
      </DialogContent>
    </Dialog>
  );
}



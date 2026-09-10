"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlossButton } from "@/components/shared/gloss-button";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, UserPlus, KeyRound, ArrowLeft, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";
import { otpService } from "@/utils/auth/otp-service";

const ChromeIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

type AuthMode = "signin" | "forgot" | "signup-details" | "signup-otp" | "signup-password";

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

export function SignInDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for NextAuth Google login errors redirected to the URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "AccountNotFound") {
        toast.error("Account not found. Please sign up first.");
        // Optional: clear the param so it doesn't show again on refresh
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "signin") {
      setIsLoading(true);
      try {
        // Pre-verify and rate limit via our API before invoking NextAuth
        await axios.post("/api/auth/verify", {
          email: formData.email,
          password: formData.password,
          provider: "credentials"
        });

        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          toast.error("Invalid email or password");
          setErrors({ email: "Invalid credentials", password: " " });
        } else {
          toast.success("Signed in successfully");
          setOpen(false);
          window.location.reload(); // Refresh to update session state
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Authentication failed");
        if (error.response?.status === 401) {
           setErrors({ email: "Invalid credentials", password: " " });
        }
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "forgot") {
      setIsLoading(true);
      try {
        await otpService.sendOtp(formData.email, 'user_forgot_password');
        toast.success("Password reset code sent to your email");
        setMode("signin");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to send reset code");
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signup-details") {
      const result = detailsSchema.safeParse(formData);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach(issue => {
          if (issue.path[0] !== undefined) {
            newErrors[String(issue.path[0])] = issue.message;
          }
        });
        setErrors(newErrors);
        return;
      }
      
      setIsLoading(true);
      try {
        // Check if email already exists
        const checkRes = await axios.post("/api/auth/check-email", { email: formData.email });
        if (checkRes.data?.data?.exists) {
          toast.error("Email is already registered. Please sign in.");
          setMode("signin");
          setIsLoading(false);
          return;
        }

        await otpService.sendOtp(formData.email, 'email_verification');
        toast.success("Verification code sent to your email");
        setMode("signup-otp");
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to process request");
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signup-otp") {
      const result = otpSchema.safeParse(formData);
      if (!result.success) {
        setErrors({ otp: result.error.issues[0].message });
        return;
      }

      setIsLoading(true);
      try {
        await otpService.verifyOtp(formData.email, formData.otp, 'email_verification');
        toast.success("Email verified successfully");
        setMode("signup-password");
      } catch (error: any) {
        setErrors({ otp: error.response?.data?.error || "Invalid OTP" });
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signup-password") {
      const result = passwordSchema.safeParse(formData);
      if (!result.success) {
        setErrors({ password: result.error.issues[0].message });
        return;
      }
      setIsLoading(true);
      try {
        // 1. Register the user
        await axios.post("/api/auth/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        // 2. Automatically sign them in
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.error) {
          toast.error("Account created, but auto-login failed. Please sign in manually.");
          setMode("signin");
        } else {
          toast.success("Account created successfully. Welcome!");
          setOpen(false);
          window.location.reload(); // Refresh to update session state
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to create account");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getHeaderIcon = () => {
    if (mode.startsWith("signup")) return <UserPlus className="w-6 h-6 text-river-300" />;
    if (mode === "forgot") return <KeyRound className="w-6 h-6 text-river-300" />;
    return <LogIn className="w-6 h-6 text-river-300" />;
  };

  const getTitle = () => {
    if (mode === "signup-details") return t("signUpTitle");
    if (mode === "signup-otp") return t("otpTitle") || "Verify your email";
    if (mode === "signup-password") return t("signUpTitle");
    if (mode === "forgot") return t("forgotPasswordTitle");
    return t("signInTitle");
  };

  const getSubtitle = () => {
    if (mode === "signup-details") return t("signUpSubtitle");
    if (mode === "signup-otp") return t("otpSubtitle") || "Enter the 6-digit code sent to your email";
    if (mode === "signup-password") return t("passwordRequirements") || "Create a secure password";
    if (mode === "forgot") return t("forgotPasswordSubtitle");
    return t("signInSubtitle");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setMode("signin");
        setFormData({ fullName: "", email: "", password: "", otp: "" });
        setErrors({});
      }, 300);
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[image:var(--background-image-gloss-ink)] text-sand-50 border-ink-700 shadow-[0_0_40px_-10px_rgba(11,93,59,0.3)] rounded-3xl overflow-hidden p-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-river-500/20 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sindoor-500/10 blur-[80px] pointer-events-none" />
        
        <motion.div layout className="relative z-10 p-6 flex flex-col" style={{ minHeight: "300px" }}>
          <motion.div layout="position" className="text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-ink-800/80 rounded-2xl flex items-center justify-center mb-4 border border-river-500/30 shadow-[0_0_20px_rgba(11,93,59,0.2)]">
              {getHeaderIcon()}
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-sand-50 text-center tracking-tight">
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-sand-200/80 text-center text-sm mt-2 px-4 leading-relaxed">
              {getSubtitle()}
            </DialogDescription>
          </motion.div>

          <motion.div layout className="mt-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {(mode === "signin" || mode === "forgot" || mode === "signup-details") && (
                  <div className="space-y-4">
                    {mode === "signup-details" && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sand-50 font-medium">{t("fullNameLabel")}</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder={t("fullNamePlaceholder")}
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`pl-10 h-12 bg-ink-900/60 border-ink-700/80 text-sand-50 placeholder:text-ink-400 focus-visible:ring-river-500 focus-visible:border-river-500/50 rounded-xl transition-all shadow-inner ${errors.fullName ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
                          />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sand-50 font-medium">{t("emailLabel")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`pl-10 h-12 bg-ink-900/60 border-ink-700/80 text-sand-50 placeholder:text-ink-400 focus-visible:ring-river-500 focus-visible:border-river-500/50 rounded-xl transition-all shadow-inner ${errors.email ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                    </div>

                    {mode === "signin" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sand-50 font-medium">{t("passwordLabel")}</Label>
                          <button 
                            type="button" 
                            onClick={() => setMode("forgot")}
                            className="text-xs font-medium text-river-300 hover:text-river-100 transition-colors"
                          >
                            {t("forgotPassword")}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder={t("passwordPlaceholder")}
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`pl-10 h-12 bg-ink-900/60 border-ink-700/80 text-sand-50 placeholder:text-ink-400 focus-visible:ring-river-500 focus-visible:border-river-500/50 rounded-xl transition-all shadow-inner ${errors.password ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
                          />
                        </div>
                        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                      </div>
                    )}
                  </div>
                )}

                {mode === "signup-otp" && (
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sand-50 font-medium">{t("otpLabel")}</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder={t("otpPlaceholder")}
                        value={formData.otp}
                        onChange={handleInputChange}
                        className={`pl-10 h-12 tracking-widest text-lg bg-ink-900/60 border-ink-700/80 text-sand-50 placeholder:text-ink-400 focus-visible:ring-river-500 focus-visible:border-river-500/50 rounded-xl transition-all shadow-inner ${errors.otp ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
                      />
                    </div>
                    {errors.otp && <p className="text-xs text-red-400">{errors.otp}</p>}
                  </div>
                )}

                {mode === "signup-password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sand-50 font-medium">{t("passwordLabel")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 h-12 bg-ink-900/60 border-ink-700/80 text-sand-50 placeholder:text-ink-400 focus-visible:ring-river-500 focus-visible:border-river-500/50 rounded-xl transition-all shadow-inner ${errors.password ? "border-red-500/50 focus-visible:ring-red-500" : ""}`}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                  </div>
                )}

                <GlossButton tone="green" type="submit" disabled={isLoading} className="w-full h-12 text-base font-bold mt-2">
                  {isLoading ? "Please wait..." : 
                   mode === "signup-details" ? t("continueButton") :
                   mode === "signup-otp" ? t("verifyOtpButton") :
                   mode === "signup-password" ? t("createAccountButton") :
                   mode === "forgot" ? t("sendResetLink") :
                   t("signInButton")}
                </GlossButton>

                {(mode === "signin" || mode === "signup-details") && (
                  <>
                    <div className="flex items-center gap-4 my-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-ink-700/80" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-ink-300">
                        {t("orContinueWith")}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-ink-700/80" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 bg-ink-800/40 border-ink-700/80 text-sand-50 hover:bg-ink-700/60 hover:text-sand-50 transition-all rounded-xl"
                      disabled={isLoading}
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await axios.post("/api/auth/verify", { provider: "google" });
                          signIn("google", { callbackUrl: "/" });
                        } catch (error: any) {
                          setIsLoading(false);
                          toast.error(error.response?.data?.error || "Authentication failed");
                        }
                      }}
                    >
                      <ChromeIcon className="mr-2 h-5 w-5" />
                      {t("googleSignIn")}
                    </Button>
                  </>
                )}
                
                <div className="text-center pt-2 text-sm text-sand-200/80">
                  {mode === "forgot" || mode === "signup-otp" || mode === "signup-password" ? (
                    <button
                      type="button"
                      onClick={() => setMode(mode === "forgot" ? "signin" : mode === "signup-otp" ? "signup-details" : "signup-otp")}
                      className="inline-flex items-center justify-center text-river-300 hover:text-river-100 font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      {mode === "forgot" ? t("backToSignIn") : "Back"}
                    </button>
                  ) : (
                    <>
                      {mode === "signup-details" ? t("haveAccount") : t("noAccount")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === "signin" ? "signup-details" : "signin");
                          setErrors({});
                        }}
                        className="text-river-300 hover:text-river-100 font-semibold transition-colors ml-1"
                      >
                        {mode === "signup-details" ? t("signInLink") : t("signUpLink")}
                      </button>
                    </>
                  )}
                </div>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

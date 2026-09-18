"use client";

import { useState } from "react";
import { z } from "zod";
import { useProfileStore } from "@/store/useProfileStore";
import { profileSchema } from "@/utils/zod/profile.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Building2, CreditCard, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export const ProfileDetails = () => {
  const t = useTranslations("profile");
  const { profile, updateDetails, isUpdating } = useProfileStore();

  const [formData, setFormData] = useState({
    fullName: profile?.profile?.fullName || "",
    phone: profile?.profile?.phone || "",
    address: profile?.profile?.address || "",
    companyName: profile?.profile?.companyName || "",
    nidNumber: profile?.profile?.nidNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevProfile, setPrevProfile] = useState(profile);

  if (profile !== prevProfile) {
    setPrevProfile(profile);
    setFormData({
      fullName: profile?.profile?.fullName || "",
      phone: profile?.profile?.phone || "",
      address: profile?.profile?.address || "",
      companyName: profile?.profile?.companyName || "",
      nidNumber: profile?.profile?.nidNumber || "",
    });
    setErrors({});
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data with Zod
      const validData = profileSchema.parse(formData);
      
      await updateDetails({
        fullName: validData.fullName,
        phone: validData.phone || null,
        address: validData.address || null,
        companyName: validData.companyName || null,
        nidNumber: validData.nidNumber || null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <span className="flex items-center text-xs text-destructive mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">
        <AlertCircle className="w-3.5 h-3.5 mr-1" />
        {errors[field]}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
      
      {/* Decorative gradient elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-river-500/10 dark:bg-river-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gold-500/10 dark:bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-river-50 dark:bg-river-500/10 text-river-600 dark:text-river-400 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t("personalInfo")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("updateDetails")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              {t("fullName")} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("fullNamePlaceholder")}
                disabled={isUpdating}
                className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.fullName ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} ${isUpdating ? "opacity-70" : ""}`}
              />
            </div>
            {renderError("fullName")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t("phoneNumber")}</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("phonePlaceholder")}
                  disabled={isUpdating}
                  className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.phone ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} ${isUpdating ? "opacity-70" : ""}`}
                />
              </div>
              {renderError("phone")}
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center">
                <Label htmlFor="nidNumber" className="text-sm font-medium text-foreground">{t("nidNumber")}</Label>
                <div className="group/tooltip relative flex items-center ml-2">
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block w-56 p-2.5 bg-card text-card-foreground text-xs font-normal rounded-lg shadow-lg border border-border z-50 animate-in fade-in slide-in-from-bottom-1 duration-200 text-center">
                    {t("nidTooltip")}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-card -mt-[1px]" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                  <CreditCard className="h-4 w-4" />
                </div>
                <Input
                  id="nidNumber"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleChange}
                  placeholder={t("nidPlaceholder")}
                  disabled={isUpdating}
                  className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.nidNumber ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} ${isUpdating ? "opacity-70" : ""}`}
                />
              </div>
              {renderError("nidNumber")}
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="companyName" className="text-sm font-medium text-foreground">{t("companyName")}</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                <Building2 className="h-4 w-4" />
              </div>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t("companyPlaceholder")}
                disabled={isUpdating}
                className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.companyName ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} ${isUpdating ? "opacity-70" : ""}`}
              />
            </div>
            {renderError("companyName")}
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="address" className="text-sm font-medium text-foreground">{t("address")}</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("addressPlaceholder")}
                disabled={isUpdating}
                className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.address ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} ${isUpdating ? "opacity-70" : ""}`}
              />
            </div>
            {renderError("address")}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span className="text-destructive mr-1">*</span> {t("requiredField")}
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white shadow-md shadow-river-500/20 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-river-500/30 active:scale-[0.98]"
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {t("saving")}
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("saveChanges")}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};





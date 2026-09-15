"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBoatStore } from "@/store/useBoatStore";
import { createBoatSchema } from "@/utils/zod/boats.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Ship, Hash, Box, Settings2, FileText, ArrowLeft, CheckCircle2, Layers } from "lucide-react";
import { FadeInUp } from "@/components/wrappers/motion-wrappers";
import { toast } from "sonner";
import { BOAT_STATUSES, BOAT_CAPACITY_UNITS } from "@/constants/boats.const";
import { SECTORS, type SectorName } from "@/constants/db/app.const";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NewBoatForm() {
  const t = useTranslations("boatsPage");
  const router = useRouter();
  const { createBoat, isSubmitting } = useBoatStore();

  const [formData, setFormData] = useState({
    name: "",
    sector: SECTORS.SAND,
    capacityValue: "",
    capacityUnit: "",
    status: BOAT_STATUSES.ACTIVE,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const validData = createBoatSchema.parse(formData);
      
      const newBoat = await createBoat({
        name: validData.name,
        sector: validData.sector as SectorName,
        capacityValue: validData.capacityValue ? Number(validData.capacityValue) : null,
        capacityUnit: validData.capacityUnit || null,
        status: validData.status,
        notes: validData.notes || null,
      });

      if (newBoat) {
        toast.success(t("form.success"));
        router.push(`/boats/${newBoat.publicId}`);
      } else {
        toast.error(t("form.error"));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = t(`form.${err.message}`);
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
    <FadeInUp>
      <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] max-w-2xl mx-auto">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-river-500/10 dark:bg-river-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-river-50 dark:bg-river-500/10 text-river-600 dark:text-river-400 rounded-xl">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {t("new.title")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("new.subtitle")}</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="h-9 px-4 hidden sm:flex">
              <Link href="/boats">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("new.back")}
              </Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                {t("form.name")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                  <Ship className="h-4 w-4" />
                </div>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("form.namePlaceholder")}
                  disabled={isSubmitting}
                  className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.name ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
                />
              </div>
              {renderError("name")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <Label htmlFor="sector" className="text-sm font-medium text-foreground">
                  Sector <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors z-10">
                    <Layers className="h-4 w-4" />
                  </div>
                  <Select
                    value={formData.sector}
                    onValueChange={(val) => handleSelectChange('sector', val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`pl-10 h-11 bg-background/50 rounded-xl`}>
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SECTORS.SAND}>Sand</SelectItem>
                      <SelectItem value={SECTORS.LIME_STONE}>Stone</SelectItem>
                      <SelectItem value={SECTORS.BRICK}>Brick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {renderError("sector")}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="status" className="text-sm font-medium text-foreground">
                  {t("form.status")}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors z-10">
                    <Settings2 className="h-4 w-4" />
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleSelectChange('status', val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`pl-10 h-11 bg-background/50 rounded-xl`}>
                      <SelectValue placeholder={t("form.statusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BOAT_STATUSES.ACTIVE}>{t("status.active")}</SelectItem>
                      <SelectItem value={BOAT_STATUSES.MAINTENANCE}>{t("status.maintenance")}</SelectItem>
                      <SelectItem value={BOAT_STATUSES.INACTIVE}>{t("status.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {renderError("status")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <Label htmlFor="capacityValue" className="text-sm font-medium text-foreground">
                  {t("form.capacityValue")}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                    <Hash className="h-4 w-4" />
                  </div>
                  <Input
                    type="number"
                    id="capacityValue"
                    name="capacityValue"
                    min="0.01"
                    step="0.01"
                    value={formData.capacityValue}
                    onChange={handleChange}
                    placeholder={t("form.capacityValuePlaceholder")}
                    disabled={isSubmitting}
                    className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-river-500/20 transition-all duration-300 rounded-xl ${errors.capacityValue ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
                  />
                </div>
                {renderError("capacityValue")}
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="capacityUnit" className="text-sm font-medium text-foreground">
                  {t("form.capacityUnit")}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors z-10">
                    <Box className="h-4 w-4" />
                  </div>
                  <Select
                    value={formData.capacityUnit}
                    onValueChange={(val) => handleSelectChange('capacityUnit', val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={`pl-10 h-11 bg-background/50 rounded-xl ${errors.capacityUnit ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}>
                      <SelectValue placeholder={t("form.capacityUnitPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BOAT_CAPACITY_UNITS.CUBIC_FT}>Cubic FT</SelectItem>
                      <SelectItem value={BOAT_CAPACITY_UNITS.TON}>Ton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {renderError("capacityUnit")}
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                {t("form.notes")}
              </Label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-muted-foreground group-focus-within:text-river-500 transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t("form.notesPlaceholder")}
                  disabled={isSubmitting}
                  className={`w-full pl-10 py-3 min-h-[100px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-river-500/20 transition-all duration-300 resize-y ${errors.notes ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
                />
              </div>
              {renderError("notes")}
            </div>

            <div className="pt-6 border-t border-border flex items-center justify-between">
              <Button 
                type="button"
                variant="ghost" 
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl sm:hidden"
                onClick={() => router.push('/boats')}
              >
                {t("form.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white shadow-md shadow-river-500/20 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-river-500/30 active:scale-[0.98] ml-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {t("form.submitting")}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("form.submit")}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FadeInUp>
  );
}

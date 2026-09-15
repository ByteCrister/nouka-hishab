"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useBoatStore } from "@/store/useBoatStore";
import { updateBoatSchema } from "@/utils/zod/boats.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Ship } from "lucide-react";
import { toast } from "sonner";
import { BOAT_STATUSES, BOAT_CAPACITY_UNITS } from "@/constants/boats.const";
import { SECTORS, type SectorName } from "@/constants/db/app.const";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BoatDetail } from "@/types/boats.types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditBoatSheetProps {
  boat: BoatDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBoatSheet({ boat, open, onOpenChange }: EditBoatSheetProps) {
  const t = useTranslations("boatsPage.detail");
  const { updateBoat, isSubmitting } = useBoatStore();

  const [formData, setFormData] = useState({
    name: boat.name,
    sector: boat.sector,
    registrationNumber: boat.registrationNumber || "",
    capacityValue: boat.capacityValue?.toString() || "",
    capacityUnit: boat.capacityUnit || "",
    lengthM: boat.lengthM?.toString() || "",
    widthM: boat.widthM?.toString() || "",
    draftM: boat.draftM?.toString() || "",
    engineMake: boat.engineMake || "",
    engineHp: boat.engineHp?.toString() || "",
    engineNotes: boat.engineNotes || "",
    boatValueTk: boat.boatValueTk?.toString() || "",
    status: boat.status,
    notes: boat.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: boat.name,
        sector: boat.sector,
        registrationNumber: boat.registrationNumber || "",
        capacityValue: boat.capacityValue?.toString() || "",
        capacityUnit: boat.capacityUnit || "",
        lengthM: boat.lengthM?.toString() || "",
        widthM: boat.widthM?.toString() || "",
        draftM: boat.draftM?.toString() || "",
        engineMake: boat.engineMake || "",
        engineHp: boat.engineHp?.toString() || "",
        engineNotes: boat.engineNotes || "",
        boatValueTk: boat.boatValueTk?.toString() || "",
        status: boat.status,
        notes: boat.notes || "",
      });
      setErrors({});
    }
  }, [open, boat]);

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
      const validData = updateBoatSchema.parse(formData);
      
      const updatedBoat = await updateBoat(boat.publicId, {
        name: validData.name,
        sector: validData.sector as SectorName,
        registrationNumber: validData.registrationNumber || null,
        capacityValue: validData.capacityValue ? Number(validData.capacityValue) : null,
        capacityUnit: validData.capacityUnit || null,
        lengthM: validData.lengthM ? Number(validData.lengthM) : null,
        widthM: validData.widthM ? Number(validData.widthM) : null,
        draftM: validData.draftM ? Number(validData.draftM) : null,
        engineMake: validData.engineMake || null,
        engineHp: validData.engineHp ? Number(validData.engineHp) : null,
        engineNotes: validData.engineNotes || null,
        boatValueTk: validData.boatValueTk ? Number(validData.boatValueTk) : null,
        status: validData.status,
        notes: validData.notes || null,
      });

      if (updatedBoat) {
        toast.success(t("save") + " successfully");
        onOpenChange(false);
      } else {
        toast.error("Error updating boat");
      }
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0">
        <div className="p-6 pb-4 border-b border-border/50">
          <SheetHeader>
            <SheetTitle className="text-xl flex items-center gap-2">
              <Ship className="w-5 h-5 text-river-500" />
              {t("edit")}
            </SheetTitle>
            <SheetDescription>
              Update information for {boat.name}.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          <form id="edit-boat-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("name")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select value={formData.sector} onValueChange={(val) => handleSelectChange('sector', val)} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SECTORS.SAND}>Sand</SelectItem>
                      <SelectItem value={SECTORS.LIME_STONE}>Stone</SelectItem>
                      <SelectItem value={SECTORS.BRICK}>Brick</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError("sector")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">{t("registrationNumber")}</Label>
                  <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} disabled={isSubmitting} placeholder={t("registrationNumberPlaceholder")} />
                  {renderError("registrationNumber")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BOAT_STATUSES.ACTIVE}>Active</SelectItem>
                      <SelectItem value={BOAT_STATUSES.MAINTENANCE}>Maintenance</SelectItem>
                      <SelectItem value={BOAT_STATUSES.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError("status")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boatValueTk">{t("boatValueTk")}</Label>
                  <Input type="number" id="boatValueTk" name="boatValueTk" value={formData.boatValueTk} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("boatValueTk")}
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Capacity & Dimensions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacityValue">Capacity</Label>
                  <Input type="number" id="capacityValue" name="capacityValue" min="0.01" step="0.01" value={formData.capacityValue} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("capacityValue")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacityUnit">Unit</Label>
                  <Select value={formData.capacityUnit} onValueChange={(val) => handleSelectChange('capacityUnit', val)} disabled={isSubmitting}>
                    <SelectTrigger className={errors.capacityUnit ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BOAT_CAPACITY_UNITS.CUBIC_FT}>Cubic FT</SelectItem>
                      <SelectItem value={BOAT_CAPACITY_UNITS.TON}>Ton</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError("capacityUnit")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lengthM">{t("lengthM")}</Label>
                  <Input type="number" id="lengthM" name="lengthM" value={formData.lengthM} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("lengthM")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="widthM">{t("widthM")}</Label>
                  <Input type="number" id="widthM" name="widthM" value={formData.widthM} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("widthM")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draftM">{t("draftM")}</Label>
                  <Input type="number" id="draftM" name="draftM" value={formData.draftM} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("draftM")}
                </div>
              </div>
            </div>

            {/* Engine Info */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engineMake">{t("engineMake")}</Label>
                  <Input id="engineMake" name="engineMake" value={formData.engineMake} onChange={handleChange} disabled={isSubmitting} placeholder={t("engineMakePlaceholder")} />
                  {renderError("engineMake")}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineHp">{t("engineHp")}</Label>
                  <Input type="number" id="engineHp" name="engineHp" value={formData.engineHp} onChange={handleChange} disabled={isSubmitting} />
                  {renderError("engineHp")}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="engineNotes">{t("engineNotes")}</Label>
                  <textarea id="engineNotes" name="engineNotes" value={formData.engineNotes} onChange={handleChange} disabled={isSubmitting} className="w-full p-3 min-h-[80px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-river-500/20 resize-y" />
                  {renderError("engineNotes")}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border/50">
              <Label htmlFor="notes">Notes</Label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} disabled={isSubmitting} className="w-full p-3 min-h-[80px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-river-500/20 resize-y" />
              {renderError("notes")}
            </div>

          </form>
        </ScrollArea>

        <div className="p-6 border-t border-border/50 bg-card">
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" form="edit-boat-form" disabled={isSubmitting} className="bg-gradient-to-r from-river-500 to-river-600 hover:from-river-600 hover:to-river-700 text-white">
              {isSubmitting ? "Saving..." : t("save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

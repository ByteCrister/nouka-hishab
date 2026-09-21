"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useUpdateReport } from "@/hooks/mutations/useReportsMutations";
import { updateReportSchema } from "@/utils/zod/reports.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AlertCircle, Edit, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ReportDetail } from "@/types/reports.types";
import { REPORT_STATUSES, type ReportStatus } from "@/constants/db/app.const";

interface EditReportSheetProps {
  report: ReportDetail;
}

export function EditReportSheet({ report }: EditReportSheetProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateReport, isPending } = useUpdateReport();

  const [formData, setFormData] = useState({
    status: report.status,
    adminReply: report.adminReply || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        status: report.status,
        adminReply: report.adminReply || "",
      });
      setErrors({});
    }
  }, [open, report]);

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
      const validData = updateReportSchema.parse(formData);
      
      await updateReport({
        publicId: report.publicId,
        payload: {
          status: validData.status as ReportStatus,
          adminReply: validData.adminReply || null,
        },
      });

      toast.success("Report updated successfully");
      setOpen(false);
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl shadow-sm h-10">
          <Edit className="w-4 h-4 mr-2" />
          Update Status
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md border-border/40 overflow-y-auto">
        <SheetHeader className="mb-6 space-y-2">
          <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Update Report
          </SheetTitle>
          <SheetDescription>
            Change the status of the report and provide a response to the user.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <Label htmlFor="status" className="text-sm font-medium text-foreground">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleSelectChange('status', val)}
              disabled={isPending}
            >
              <SelectTrigger className={`h-11 bg-background/50 rounded-xl`}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(REPORT_STATUSES).map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError("status")}
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="adminReply" className="text-sm font-medium text-foreground">
              Admin Reply
            </Label>
            <div className="relative">
              <textarea
                id="adminReply"
                name="adminReply"
                value={formData.adminReply}
                onChange={handleChange}
                placeholder="Provide a resolution or update message..."
                disabled={isPending}
                className={`w-full p-3 min-h-[200px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-y ${errors.adminReply ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
              />
            </div>
            {renderError("adminReply")}
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-end gap-3">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="h-11 px-6 rounded-xl shadow-md transition-all duration-300 ease-out active:scale-[0.98]"
            >
              {isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Saving
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

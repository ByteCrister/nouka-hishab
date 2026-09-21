"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCreateReport } from "@/hooks/mutations/useReportsMutations";
import { createReportSchema } from "@/utils/zod/reports.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, ArrowLeft, CheckCircle2, Layers, X, Image as ImageIcon } from "lucide-react";
import { FadeInUp } from "@/components/wrappers/motion-wrappers";
import { toast } from "sonner";
import { REPORT_CATEGORIES, type ReportCategory } from "@/constants/db/app.const";
import { useMediaUpload } from "@/hooks/media/use-media-upload";
import { Link } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export function NewReportForm() {
  const router = useRouter();
  const { mutateAsync: createReport, isPending: isSubmitting } = useCreateReport();
  const tSand = useTranslations('sand');
  const tReportsList = useTranslations('reportsPage.list.header');
  const tNew = useTranslations('reportsPage.new.header');
  const tForm = useTranslations('reportsPage.new.form');
  const tCategory = useTranslations('reportsPage.list.category');

  const breadcrumbItems = [
    { label: tSand('home'), href: '/', isHome: true },
    { label: tReportsList('title'), href: '/reports' },
    { label: tNew('title') }
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: REPORT_CATEGORIES.BUG,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMedia, isUploading } = useMediaUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 3) {
      toast.error(tForm('maxFilesError'));
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(tForm('invalidTypeError', { name: file.name }));
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(tForm('maxSizeError', { name: file.name }));
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = ''; // reset input
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
      const validData = createReportSchema.parse(formData);
      
      let attachmentIds: number[] = [];
      if (selectedFiles.length > 0) {
        const uploadResults = await uploadMedia(selectedFiles);
        attachmentIds = uploadResults.map(result => result.fileId);
      }
      
      const newReport = await createReport({
        title: validData.title,
        category: validData.category as ReportCategory,
        description: validData.description || null,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      toast.success(tForm('success'));
      router.push(`/reports/${newReport.publicId}`);
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
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      <FadeInUp>
        <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] max-w-2xl mx-auto mt-4">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {tNew('title')}
                </h2>
                <p className="text-sm text-muted-foreground">{tNew('subtitle')}</p>
              </div>
            </div>
            <Button variant="ghost" asChild className="h-9 px-4 hidden sm:flex">
              <Link href="/reports">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {tNew('back')}
              </Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                {tForm('title')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={tForm('titlePlaceholder')}
                  disabled={isSubmitting}
                  className={`pl-10 h-11 bg-background/50 border-input focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl ${errors.title ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
                />
              </div>
              {renderError("title")}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">
                {tForm('category')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                  <Layers className="h-4 w-4" />
                </div>
                <Select
                  value={formData.category}
                  onValueChange={(val) => handleSelectChange('category', val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`pl-10 h-11 bg-background/50 rounded-xl`}>
                    <SelectValue placeholder={tForm('categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(REPORT_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{tCategory(cat as Parameters<typeof tCategory>[0])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {renderError("category")}
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                {tForm('description')}
              </Label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={tForm('descriptionPlaceholder')}
                  disabled={isSubmitting}
                  className={`w-full p-3 min-h-[120px] text-sm bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-y ${errors.description ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""}`}
                />
              </div>
              {renderError("description")}
            </div>

            <div className="space-y-3 group">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  {tForm('attachments')}
                </Label>
                <span className="text-xs text-muted-foreground">{tForm('attachmentsHint')}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="relative group/file rounded-xl overflow-hidden border border-border/50 bg-background/50 h-32">
                    <Image 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover/file:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeFile(idx)}
                        disabled={isSubmitting || isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {selectedFiles.length < 3 && (
                  <Label 
                    htmlFor="report-images" 
                    className={`relative rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 bg-background/30 hover:bg-background/50 h-32 flex flex-col items-center justify-center cursor-pointer transition-all ${isSubmitting || isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium px-4 text-center">
                      {tForm('dropzoneText')}
                    </span>
                    <input
                      id="report-images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isSubmitting || isUploading}
                    />
                  </Label>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-border flex items-center justify-between">
              <Button 
                type="button"
                variant="ghost" 
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl sm:hidden"
                onClick={() => router.push('/reports')}
              >
                {tForm('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isUploading}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md transition-all duration-300 ease-out active:scale-[0.98] ml-auto"
              >
                {isSubmitting || isUploading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    {tForm('submitting')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {tForm('submit')}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      </FadeInUp>
    </div>
  );
}

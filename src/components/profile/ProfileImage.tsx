"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, Upload, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useMediaUpload } from "@/hooks/media/use-media-upload";
import { toast } from "sonner";
import Image from "next/image";

import { useProfileStore } from "@/store/useProfileStore";

export const ProfileImage = () => {
  const t = useTranslations("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, isUploading, progress } = useMediaUpload();
  const { profile, updateImage } = useProfileStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., max 5MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const results = await uploadMedia([selectedFile]);
      if (results.length > 0) {
        const { fileId, url } = results[0];
        await updateImage({ avatarFileId: fileId }, url);
        toast.success(t("imageUploadedSuccessfully", { fallback: "Image uploaded successfully" }));
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("uploadFailed", { fallback: "Upload failed" });
      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const progressValues = Object.values(progress);
  const avgProgress =
    progressValues.length > 0
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;

  const displayUrl = previewUrl || profile?.avatarUrl;

  return (
    <div className="relative overflow-hidden bg-card/70 backdrop-blur-xl p-8 rounded-2xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center">
      
      {/* Decorative gradient elements */}
      <div className="absolute top-0 left-0 -ml-16 -mt-16 w-48 h-48 bg-river-500/10 dark:bg-river-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-6 text-foreground self-start">{t("profilePicture")}</h3>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-river-500 to-river-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <div className="relative h-36 w-36 bg-background border-2 border-dashed border-border rounded-full flex flex-col items-center justify-center text-muted-foreground overflow-hidden group-hover:border-river-400 dark:group-hover:border-river-500 transition-colors duration-300">
            {displayUrl ? (
              <>
                <Image src={displayUrl} alt="Profile" fill sizes="144px" className="object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 mb-1 animate-spin text-river-500" />
                    <span className="text-xs font-bold text-foreground drop-shadow-md">{Math.round(avgProgress)}%</span>
                  </div>
                )}
              </>
            ) : isUploading ? (
              <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 mb-1 animate-spin text-river-500" />
                <span className="text-xs font-bold text-foreground">{Math.round(avgProgress)}%</span>
              </div>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium opacity-70">{t("noImage")}</span>
              </>
            )}
          </div>
          
          {(!selectedFile && !isUploading) && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-river-600 hover:bg-river-700 text-white rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95"
              title={t("uploadImage")}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {selectedFile && !isUploading ? (
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-river-600 hover:bg-river-700 text-white rounded-xl"
            >
              <Check className="w-4 h-4 mr-2" />
              {t("save", { fallback: "Save" })}
            </Button>
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="flex-1 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              {t("cancel", { fallback: "Cancel" })}
            </Button>
          </div>
        ) : (
          <>
            <Button 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full rounded-xl border-border bg-background/50 hover:bg-muted"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {selectedFile && isUploading ? t("uploading", { fallback: "Uploading..." }) : t("uploadImage")}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">
              {t("allowedFormats")}
            </p>
          </>
        )}
      </div>
    </div>
  );
};





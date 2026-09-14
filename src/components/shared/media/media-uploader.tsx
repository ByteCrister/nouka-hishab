import { useRef } from "react";
import { useMediaUpload } from "@/hooks/media/use-media-upload";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaUploaderProps {
  onUploadSuccess: (urls: string[], fileIds: number[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
  accept?: string;
}

export function MediaUploader({
  onUploadSuccess,
  multiple = false,
  maxSizeMB = 2,
  className,
  accept = "image/*,application/pdf",
}: MediaUploaderProps) {
  const { uploadMedia, isUploading, progress } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const results = await uploadMedia(files);
      const urls = results.map((r) => r.url);
      const fileIds = results.map((r) => r.fileId);
      
      onUploadSuccess(urls, fileIds);
      toast.success("Upload successful");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // We can just show a generic progress if there's any uploading happening
  const progressValues = Object.values(progress);
  const avgProgress =
    progressValues.length > 0
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-card/50 transition-colors bg-card",
        isUploading ? "opacity-50 pointer-events-none" : "border-border",
        className
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-river" />
          <span className="text-sm text-muted-foreground font-medium">
            Uploading... {Math.round(avgProgress)}%
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium text-center px-4">
            Click or drag and drop to upload
          </span>
        </div>
      )}
    </div>
  );
}

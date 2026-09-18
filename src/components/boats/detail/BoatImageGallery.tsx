import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUploadBoatImage, useDeleteBoatImage } from '@/hooks/mutations/useBoatMutations';
import { useMediaUpload } from '@/hooks/media/use-media-upload';
import { Camera, Image as ImageIcon, Loader2, Star, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import type { BoatDetail } from '@/types/boats.types';

interface BoatImageGalleryProps {
  boat: BoatDetail;
}

export function BoatImageGallery({ boat }: BoatImageGalleryProps) {
  const t = useTranslations('boatsPage.detail');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMedia, isUploading } = useMediaUpload();
  const { mutateAsync: uploadBoatImage, isPending: isUploadingImage } = useUploadBoatImage();
  const { mutateAsync: deleteBoatImage, isPending: isDeletingImage } = useDeleteBoatImage();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const maxImagesLimit = 5;
  const isLimitReached = boat.images.length >= maxImagesLimit;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      const results = await uploadMedia([selectedFile]);
      if (results.length > 0) {
        const { fileId } = results[0];
        const isPrimary = boat.images.length === 0;
        await uploadBoatImage({ publicId: boat.publicId, fileId, isPrimary });
        toast.success(t('imageUploaded'));
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetPrimary = async (fileId: number) => {
    try {
      setIsProcessing(true);
      await uploadBoatImage({ publicId: boat.publicId, fileId, isPrimary: true });
      toast.success(t('primarySet'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      setIsProcessing(true);
      await deleteBoatImage({ publicId: boat.publicId, fileId });
      toast.success(t('imageDeleted'));
    } finally {
      setIsProcessing(false);
    }
  };

  const showLoader = isUploading || isUploadingImage || isDeletingImage || isProcessing;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          {t('images')}
        </h2>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={showLoader || isLimitReached}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={showLoader || isLimitReached || !!selectedFile}
            className="shadow-md shadow-primary/20"
          >
            {showLoader ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            {showLoader ? t('uploading') : isLimitReached ? 'Limit Reached' : t('uploadImage')}
          </Button>
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {boat.images.length} / {maxImagesLimit} Images
          </div>
        </div>
      </div>

      {previewUrl && selectedFile && (
        <div className="mb-8 p-4 border border-border/50 rounded-xl bg-muted/20 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Preview Image</h3>
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg overflow-hidden border-2 border-border mb-4">
            <Image 
              src={previewUrl} 
              alt="Preview" 
              fill 
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-cover"
            />
            {showLoader && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="flex gap-3 w-full max-w-sm">
            <Button 
              onClick={handleSave}
              disabled={showLoader}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={showLoader}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {boat.images.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {t('noImages')}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boat.images.map((img) => (
            <div 
              key={img.fileId} 
              className={`relative group rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${
                img.isPrimary ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/50 hover:border-primary/50'
              }`}
            >
              <Image 
                src={img.url} 
                alt={`Boat image ${img.fileId}`}
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  {img.isPrimary ? (
                    <div className="bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm shadow-sm">
                      <Star className="w-3 h-3 fill-current" /> Primary
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-7 text-xs bg-white/90 hover:bg-white text-black font-semibold"
                      onClick={() => handleSetPrimary(img.fileId)}
                      disabled={showLoader}
                    >
                      {t('setPrimary')}
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-between items-end">
                  <div /> {/* Spacer */}
                  <Button 
                    size="icon"
                    variant="destructive" 
                    className="h-8 w-8 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(img.fileId)}
                    disabled={showLoader}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



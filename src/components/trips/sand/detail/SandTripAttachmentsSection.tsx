'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  useCreateSandTripAttachment,
  useDeleteSandTripAttachment,
} from '@/hooks/mutations/useSandTripsMutations';
import { createTripAttachmentSchema } from '@/utils/zod/sand-trips.schema';
import { TripAttachmentItem } from '@/types/trips.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Paperclip, X, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useMediaUpload } from '@/hooks/media/use-media-upload';

interface Props {
  tripPublicId: string;
  boatPublicId: string;
  attachments: TripAttachmentItem[];
}

export function SandTripAttachmentsSection({ tripPublicId, boatPublicId, attachments }: Props) {
  const t = useTranslations('sandTripsDetail');
  const [showAdd, setShowAdd] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { uploadMedia, isUploading, progress } = useMediaUpload();

  const { mutateAsync: createAttachment, isPending: isCreating } = useCreateSandTripAttachment(() => {
    setShowAdd(false);
    setFile(null);
    setDescription('');
  });
  const { mutateAsync: deleteAttachment, isPending: isDeleting } = useDeleteSandTripAttachment();

  const renderError = (field: string) => errors[field] ? (
    <span className="flex items-center text-xs text-destructive mt-1 font-medium">
      <AlertCircle className="w-3 h-3 mr-1" />{errors[field]}
    </span>
  ) : null;

  const handleSubmit = async () => {
    setErrors({});
    if (!file) {
      setErrors({ file: t('attachments.fileRequired', { fallback: 'File is required' }) });
      return;
    }

    try {
      // 1. Upload to cloudinary + create DB record
      const uploadResults = await uploadMedia([file]);
      const fileId = uploadResults[0].fileId;

      // 2. Attach to trip
      const payload = createTripAttachmentSchema.parse({
        boatPublicId,
        fileId,
        description: description || null,
      });
      await createAttachment({ tripPublicId, payload });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        err.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; });
        setErrors(fe);
      } else {
        setErrors({ file: t('attachments.uploadFailed', { fallback: 'Upload failed' }) });
      }
    }
  };

  const handleDelete = async (fileId: number) => {
    if (deleteConfirm !== fileId) { setDeleteConfirm(fileId); return; }
    await deleteAttachment({ tripPublicId, fileId });
    setDeleteConfirm(null);
  };

  const cancelForm = () => { 
    setShowAdd(false); 
    setFile(null);
    setDescription('');
    setErrors({}); 
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);
  const isPending = isUploading || isCreating;
  
  // Try to find the progress for the current file if it has a predictable ID in the hook (it uses ulid internally, so we just show a generic loading state if isUploading is true, but hook exposes a progress dictionary by ID). We'll just rely on isUploading.

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">{t('attachments.title')}</h3>
          {attachments.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">{attachments.length}</span>
          )}
        </div>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="h-8 px-3 rounded-lg text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />{t('attachments.attachFile')}
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <p className="text-sm font-medium">{t('attachments.uploadNewFile', { fallback: 'Upload a new file' })}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t('attachments.file', { fallback: 'File' })} *</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className={`text-sm bg-background/50 ${errors.file ? 'border-destructive' : ''}`}
                disabled={isPending}
              />
              {renderError('file')}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('attachments.description')}</Label>
              <Input
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors(p => { const n = { ...p }; delete n.description; return n; });
                }}
                placeholder={t('attachments.descriptionPlaceholder')}
                className="h-10 rounded-lg text-sm bg-background/50"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={cancelForm} disabled={isPending} className="h-8 rounded-lg">
              <X className="w-3.5 h-3.5 mr-1" />{t('attachments.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isPending || !file} className="h-8 rounded-lg">
              {isPending ? (
                <div className="flex items-center">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isUploading ? t('attachments.uploading', { fallback: 'Uploading...' }) : t('attachments.saving', { fallback: 'Saving...' })}
                </div>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{t('attachments.attach')}</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Attachment Grid */}
      {attachments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{t('attachments.noAttachments')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map((att) => (
            <div
              key={att.fileId}
              className="group relative rounded-xl border border-border/40 bg-background/40 overflow-hidden hover:border-primary/30 transition-all"
            >
              {/* Preview */}
              {isImage(att.url) ? (
                <div className="relative h-32 bg-muted/40">
                  <Image src={att.url} alt={att.originalFileName} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-muted/30 flex items-center justify-center">
                  <Paperclip className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-medium truncate text-foreground">{att.originalFileName}</p>
                {att.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{att.description}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {new Date(att.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 w-7 rounded-lg bg-background/90 border border-border/60 flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="h-7 w-7 rounded-lg border bg-background/90 border-border/60 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteConfirm.attachmentTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirm.attachmentDescription')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(att.fileId);
                        }}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting && deleteConfirm === att.fileId ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          t('deleteConfirm.delete')
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



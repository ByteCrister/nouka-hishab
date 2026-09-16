'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  useCreateSandTripAttachment,
  useDeleteSandTripAttachment,
} from '@/hooks/mutations/useSandTripsMutations';
import { createSandTripAttachmentSchema } from '@/utils/zod/sand-trips.schema';
import { SandTripAttachmentItem } from '@/types/sand/trips.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Paperclip, X, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Props {
  tripPublicId: string;
  attachments: SandTripAttachmentItem[];
}

type AttachForm = { fileId: string; description: string };
const emptyForm: AttachForm = { fileId: '', description: '' };

export function SandTripAttachmentsSection({ tripPublicId, attachments }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AttachForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { mutateAsync: createAttachment, isPending: isCreating } = useCreateSandTripAttachment(() => {
    setShowAdd(false);
    setForm(emptyForm);
  });
  const { mutateAsync: deleteAttachment, isPending: isDeleting } = useDeleteSandTripAttachment();

  const set = (k: keyof AttachForm, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const renderError = (field: string) => errors[field] ? (
    <span className="flex items-center text-xs text-destructive mt-1 font-medium">
      <AlertCircle className="w-3 h-3 mr-1" />{errors[field]}
    </span>
  ) : null;

  const handleSubmit = async () => {
    setErrors({});
    try {
      const payload = createSandTripAttachmentSchema.parse({
        fileId: parseInt(form.fileId, 10),
        description: form.description || null,
      });
      await createAttachment({ tripPublicId, payload });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        err.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; });
        setErrors(fe);
      }
    }
  };

  const handleDelete = async (fileId: number) => {
    if (deleteConfirm !== fileId) { setDeleteConfirm(fileId); return; }
    await deleteAttachment({ tripPublicId, fileId });
    setDeleteConfirm(null);
  };

  const cancelForm = () => { setShowAdd(false); setForm(emptyForm); setErrors({}); };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Attachments</h3>
          {attachments.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">{attachments.length}</span>
          )}
        </div>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="h-8 px-3 rounded-lg text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />Attach File
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-5 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
          <p className="text-sm font-medium">Attach File by ID</p>
          <p className="text-xs text-muted-foreground">
            Enter the numeric file ID from the uploaded file record.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">File ID *</Label>
              <Input
                type="number"
                value={form.fileId}
                onChange={(e) => set('fileId', e.target.value)}
                placeholder="e.g. 42"
                className={`h-9 rounded-lg text-sm bg-background/50 ${errors.fileId ? 'border-destructive' : ''}`}
              />
              {renderError('fileId')}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Optional label"
                className="h-9 rounded-lg text-sm bg-background/50"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={cancelForm} className="h-8 rounded-lg">
              <X className="w-3.5 h-3.5 mr-1" />Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isCreating} className="h-8 rounded-lg">
              {isCreating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Attach</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Attachment Grid */}
      {attachments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No attachments yet.</p>
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
                  <Image src={att.url} alt={att.originalFileName} fill className="object-cover" />
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
                <button
                  onClick={() => handleDelete(att.fileId)}
                  disabled={isDeleting}
                  className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors ${
                    deleteConfirm === att.fileId
                      ? 'bg-destructive text-white border-destructive'
                      : 'bg-background/90 border-border/60 hover:bg-rose-500/10 hover:text-rose-500'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

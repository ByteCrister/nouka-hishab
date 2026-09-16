"use client";

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useUploadBoatDocument, useDeleteBoatDocument } from '@/hooks/mutations/useBoatMutations';
import { useMediaUpload } from '@/hooks/media/use-media-upload';
import { FileText, Loader2, Trash2, Upload, FileSignature, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BoatDetail, BoatDocument } from '@/types/boats.types';

interface BoatDocumentsSectionProps {
  boat: BoatDetail;
}

export function BoatDocumentsSection({ boat }: BoatDocumentsSectionProps) {
  const t = useTranslations('boatsPage.detail');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMedia, isUploading } = useMediaUpload();
  const { mutateAsync: uploadBoatDocument, isPending: isUploadingDoc } = useUploadBoatDocument();
  const { mutateAsync: deleteBoatDocument, isPending: isDeletingDoc } = useDeleteBoatDocument();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    documentType: '',
    description: '',
    expiryDate: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsDialogOpen(true);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.documentType) {
      toast.error('File and Document Type are required');
      return;
    }

    try {
      setIsProcessing(true);
      const results = await uploadMedia([selectedFile]);
      if (results.length > 0) {
        const { fileId } = results[0];
        await uploadBoatDocument({
          publicId: boat.publicId,
          payload: {
            fileId,
            documentType: formData.documentType,
            description: formData.description || undefined,
            expiryDate: formData.expiryDate || undefined,
          },
        });
        toast.success(t('documentUploaded') || 'Document uploaded successfully');
        setIsDialogOpen(false);
        setSelectedFile(null);
        setFormData({ documentType: '', description: '', expiryDate: '' });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm(t('deleteConfirmDesc') || 'Are you sure you want to delete this document?')) return;
    try {
      setIsProcessing(true);
      await deleteBoatDocument({ publicId: boat.publicId, documentId });
      toast.success(t('documentDeleted') || 'Document deleted successfully');
    } finally {
      setIsProcessing(false);
    }
  };

  const showLoader = isUploading || isUploadingDoc || isDeletingDoc || isProcessing;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-river-500" />
          {t('documents') || 'Documents'}
        </h2>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,image/*"
            onChange={handleFileChange}
            disabled={showLoader}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={showLoader}
            variant="outline"
            className="border-river-200 text-river-600 hover:bg-river-50 dark:border-river-900/50 dark:text-river-400 dark:hover:bg-river-900/20"
          >
            {showLoader ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {t('uploadDocument') || 'Upload Document'}
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Document Details</DialogTitle>
              <DialogDescription>
                Provide information for {selectedFile?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">{t('documentType') || 'Document Type'} *</Label>
                <Input
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleFormChange}
                  placeholder={t('documentTypePlaceholder') || 'e.g. Registration'}
                  disabled={showLoader}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('description') || 'Description'}</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={showLoader}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t('expiryDate') || 'Expiry Date'}</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleFormChange}
                  disabled={showLoader}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={showLoader}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={showLoader || !formData.documentType}>
                {showLoader && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('uploadDocument') || 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!boat.documents || boat.documents.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {t('noDocuments') || 'No documents available for this boat.'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boat.documents.map((doc: BoatDocument) => (
            <div key={doc.id} className="relative group flex flex-col p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-river-50 dark:bg-river-900/20 text-river-600 dark:text-river-400 rounded-lg">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">{doc.documentType}</h4>
                    <span className="text-xs text-muted-foreground uppercase">{doc.format}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="View Document">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} disabled={showLoader} className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete Document">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {doc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
                  {doc.description}
                </p>
              )}
              
              {doc.expiryDate && (
                <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded w-fit">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires: {formatDate(doc.expiryDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ASSET_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  PDF: 'pdf',
  DOCX: 'docx',
  OTHER: 'other'
} as const;
export type AssetType = typeof ASSET_TYPES[keyof typeof ASSET_TYPES];

export const ASSET_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  DELETED: 'deleted'
} as const;
export type AssetStatus = typeof ASSET_STATUSES[keyof typeof ASSET_STATUSES];




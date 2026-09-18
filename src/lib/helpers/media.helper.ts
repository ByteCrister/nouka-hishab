import { db } from '@/config/db';
import { assets, files } from '@/db/media';
import { uploadToCloudinary } from '@/lib/services/cloudinary.service';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';

export type AssetType = 'image' | 'pdf' | 'docx' | 'other';

export function determineAssetType(mimeType: string): AssetType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return 'docx';
  }
  return 'other';
}

export interface MediaUploadInput {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  description?: string;
  uploadedBy: number;
}

export interface MediaUpdateInput {
  oldFileId: number;
  newInput: MediaUploadInput;
}

/**
 * @deprecated Use client-side `useMediaUpload` hook directly for direct-to-cloudinary browser uploads instead.
 * 
 * Adds multiple media assets.
 * Deduplicates by file hash and asset type.
 * Uploads to Cloudinary only if the asset is new.
 */
export const addMediaAssets = async (inputs: MediaUploadInput[]) => {
  const results = [];

  for (const input of inputs) {
    const fileHash = crypto.createHash('sha256').update(input.buffer).digest('hex');
    const assetType = determineAssetType(input.mimeType);

    // Check if the asset already exists in the DB
    const existingAsset = await db.query.assets.findFirst({
      where: and(eq(assets.fileHash, fileHash), eq(assets.assetType, assetType)),
    });

    let assetId: number;

    if (existingAsset) {
      assetId = existingAsset.id;
    } else {
      // Upload to Cloudinary
      const cloudResult = await uploadToCloudinary(input.buffer, assetType, input.originalFileName);

      // Save new asset record
      const [newAsset] = await db
        .insert(assets)
        .values({
          cloudinaryPublicId: cloudResult.public_id,
          cloudinaryUrl: cloudResult.secure_url,
          assetType,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          fileHash,
        })
        .returning();

      assetId = newAsset.id;
    }

    // Save the file reference
    const [newFile] = await db
      .insert(files)
      .values({
        assetId,
        uploadedBy: input.uploadedBy,
        originalFileName: input.originalFileName,
        description: input.description,
      })
      .returning();

    results.push(newFile);
  }

  return results;
};

/**
 * @deprecated Use client-side `useMediaUpload` hook directly for direct-to-cloudinary browser uploads instead.
 * 
 * Updates media assets by taking an array of inputs with their corresponding old file IDs.
 * Soft-deletes the old file (deletedAt = new Date()), and processes the new one same as adding.
 */
export const updateMediaAssets = async (updates: MediaUpdateInput[]) => {
  const results = [];

  for (const update of updates) {
    const { oldFileId, newInput } = update;

    const fileHash = crypto.createHash('sha256').update(newInput.buffer).digest('hex');
    const assetType = determineAssetType(newInput.mimeType);

    // Check if the new asset already exists in the DB
    const existingAsset = await db.query.assets.findFirst({
      where: and(eq(assets.fileHash, fileHash), eq(assets.assetType, assetType)),
    });

    let assetId: number;

    if (existingAsset) {
      assetId = existingAsset.id;
    } else {
      // Upload to Cloudinary
      const cloudResult = await uploadToCloudinary(newInput.buffer, assetType, newInput.originalFileName);

      // Save new asset record
      const [newAsset] = await db
        .insert(assets)
        .values({
          cloudinaryPublicId: cloudResult.public_id,
          cloudinaryUrl: cloudResult.secure_url,
          assetType,
          mimeType: newInput.mimeType,
          sizeBytes: newInput.sizeBytes,
          fileHash,
        })
        .returning();

      assetId = newAsset.id;
    }

    // Soft-delete the old file
    await db
      .update(files)
      .set({ deletedAt: new Date() })
      .where(eq(files.id, oldFileId));

    // Create the new file reference
    const [newFile] = await db
      .insert(files)
      .values({
        assetId,
        uploadedBy: newInput.uploadedBy,
        originalFileName: newInput.originalFileName,
        description: newInput.description,
      })
      .returning();

    results.push(newFile);
  }

  return results;
};



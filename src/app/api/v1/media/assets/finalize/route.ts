import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { assets, files } from "@/db/media";
import { eq, and } from "drizzle-orm";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { users } from "@/db/app";
import { ASSET_TYPES, ASSET_STATUSES, AssetType } from "@/constants/db/media.const";
import { withTransaction } from "@/lib/helpers/withTransaction";

const ASSET_TYPE_VALUES = Object.values(ASSET_TYPES) as [AssetType, ...AssetType[]];

const finalizeItemSchema = z.object({
  id: z.string(),
  fileHash: z.string().length(64),
  assetType: z.enum(ASSET_TYPE_VALUES),
  originalFileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  description: z.string().optional(),
  cloudinaryPublicId: z.string(),
  cloudinaryUrl: z.string().url(),
  cloudinaryResourceType: z.string().optional(),
  cloudinaryFormat: z.string().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

const finalizeSchema = z.object({
  items: z.array(finalizeItemSchema).min(1).max(50),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userPublicId = await requireAuthPublicId();

  // Find user internal ID
  const user = await db.query.users.findFirst({
    where: eq(users.publicId, userPublicId),
    columns: { id: true },
  });

  if (!user) throw new Error("User not found");

  const body = await req.json();
  const { items } = finalizeSchema.parse(body);

  const results: { id: string; fileId: number; url: string }[] = [];

  await withTransaction(async (tx) => {
    for (const item of items) {
      // 1. Check if asset was created by a concurrent request
      let assetId: number;
      const existingAsset = await tx.query.assets.findFirst({
        where: and(eq(assets.fileHash, item.fileHash), eq(assets.assetType, item.assetType)),
      });

      if (existingAsset) {
        assetId = existingAsset.id;
      } else {
        // Create new asset
        const [newAsset] = await tx
          .insert(assets)
          .values({
            cloudinaryPublicId: item.cloudinaryPublicId,
            cloudinaryUrl: item.cloudinaryUrl,
            assetType: item.assetType,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
            fileHash: item.fileHash,
            status: ASSET_STATUSES.READY,
            cloudinaryResourceType: item.cloudinaryResourceType,
            cloudinaryFormat: item.cloudinaryFormat,
            width: item.width,
            height: item.height,
          })
          .returning();
        assetId = newAsset.id;
      }

      // 3. Create the new file reference
      const [newFile] = await tx
        .insert(files)
        .values({
          assetId,
          uploadedBy: user.id,
          originalFileName: item.originalFileName,
          description: item.description,
        })
        .returning();

      results.push({
        id: item.id,
        fileId: newFile.id,
        url: item.cloudinaryUrl,
      });
    }
  });

  return { data: { results } };
});

// Trigger Next.js hot-reload

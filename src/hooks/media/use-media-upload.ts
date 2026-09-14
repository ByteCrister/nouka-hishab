import { useState } from "react";
import axios from "axios";
import { ulid } from "ulid";

export type AssetType = "image" | "pdf" | "docx" | "other";

export function determineAssetType(mimeType: string): AssetType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return "docx";
  }
  return "other";
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface UploadResult {
  id: string; // The local id passed initially
  fileId: number; // The database id of the created `files` record
  url: string; // The Cloudinary URL
}

export type FinalizeItem =
  | {
      isExists: true;
      id: string;
      status: "EXISTS";
      fileId: number;
      url: string;
    }
  | {
      isExists: false;
      id: string;
      fileHash: string;
      assetType: AssetType;
      originalFileName: string;
      mimeType: string;
      sizeBytes: number;
      cloudinaryPublicId: string;
      cloudinaryUrl: string;
      cloudinaryResourceType?: string;
      cloudinaryFormat?: string;
      width?: number;
      height?: number;
      oldFileId?: number;
    };

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  const uploadMedia = async (files: File[], oldFileId?: number): Promise<UploadResult[]> => {
    setIsUploading(true);
    setProgress({});

    try {
      const items = await Promise.all(
        files.map(async (file) => ({
          id: ulid(),
          file,
          fileHash: await hashFile(file),
          assetType: determineAssetType(file.type),
          originalFileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }))
      );

      // 1. Prepare
      const preparePayload = {
        items: items.map(({ id, fileHash, assetType, originalFileName, mimeType, sizeBytes }) => ({
          id,
          fileHash,
          assetType,
          originalFileName,
          mimeType,
          sizeBytes,
        })),
      };

      const prepareRes = await axios.post("/api/v1/media/assets/prepare", preparePayload);
      const prepareResults = prepareRes.data.data.results;

      const finalizeItems: FinalizeItem[] = [];
      const uploadPromises: Promise<void>[] = [];

      // 2. Process uploads
      for (let i = 0; i < prepareResults.length; i++) {
        const prepareResult = prepareResults[i];
        const item = items.find((itm) => itm.id === prepareResult.id)!;

        if (prepareResult.status === "EXISTS") {
          // Already uploaded, we just need its id/url for the final return (or we could pass it to finalize again? 
          // Wait, prepare already created the file record if it was EXISTS! 
          // But wait, my prepare endpoint actually inserted the `files` record. Let's make sure finalize is called for everything, OR we return it directly.
          // In my prepare endpoint, if EXISTS, it created the `files` record. So we can just collect it.
          finalizeItems.push({
             ...prepareResult,
             isExists: true,
          });
        } else if (prepareResult.status === "UPLOAD_REQUIRED") {
          const { uploadParams } = prepareResult;

          // Upload to Cloudinary directly
          const formData = new FormData();
          formData.append("file", item.file);
          formData.append("api_key", uploadParams.api_key);
          formData.append("timestamp", String(uploadParams.timestamp));
          formData.append("signature", uploadParams.signature);
          formData.append("folder", uploadParams.folder);
          if (uploadParams.public_id) {
            formData.append("public_id", uploadParams.public_id);
          }

          const promise = axios
            .post(`https://api.cloudinary.com/v1_1/${uploadParams.cloud_name}/auto/upload`, formData, {
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setProgress((prev) => ({ ...prev, [item.id]: percentCompleted }));
                }
              },
            })
            .then((cloudRes) => {
              const data = cloudRes.data;
              finalizeItems.push({
                id: item.id,
                fileHash: item.fileHash,
                assetType: item.assetType,
                originalFileName: item.originalFileName,
                mimeType: item.mimeType,
                sizeBytes: item.sizeBytes,
                cloudinaryPublicId: data.public_id,
                cloudinaryUrl: data.secure_url,
                cloudinaryResourceType: data.resource_type,
                cloudinaryFormat: data.format,
                width: data.width,
                height: data.height,
                oldFileId,
                isExists: false,
              });
            });

          uploadPromises.push(promise);
        }
      }

      await Promise.all(uploadPromises);

      // 3. Finalize
      const itemsToFinalize = finalizeItems.filter((i) => !i.isExists);
      let finalizedData: UploadResult[] = [];

      if (itemsToFinalize.length > 0) {
        const finalizeRes = await axios.post("/api/v1/media/assets/finalize", {
          items: itemsToFinalize,
        });
        finalizedData = finalizeRes.data.data.results;
      }

      // Merge EXISTS results with Finalized results
      const allResults: UploadResult[] = items.map((item) => {
        const matchItem = finalizeItems.find((i) => i.id === item.id);
        if (matchItem && matchItem.isExists) {
          return { id: matchItem.id, fileId: matchItem.fileId, url: matchItem.url };
        }
        const finalizedItem = finalizedData.find((i) => i.id === item.id);
        if (finalizedItem) {
          return { id: finalizedItem.id, fileId: finalizedItem.fileId, url: finalizedItem.url };
        }
        throw new Error("Upload failed for item: " + item.id);
      });

      return allResults;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, isUploading, progress };
}

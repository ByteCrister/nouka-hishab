import { cloudinary } from '@/config/cloudinary';
import { env } from '@/config/env';
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import crypto from 'crypto';

export const uploadToCloudinary = (
  buffer: Buffer,
  assetType: string,
  originalFileName?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const folder = `${env.CLOUDINARY_FOLDER}/${assetType}`;

    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: 'auto',
    };

    if (originalFileName) {
      // Remove extension and sanitize (replace non-alphanumeric with underscores)
      const nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
      const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      const randomStr = crypto.randomBytes(4).toString('hex');
      uploadOptions.public_id = `${sanitized}_${randomStr}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

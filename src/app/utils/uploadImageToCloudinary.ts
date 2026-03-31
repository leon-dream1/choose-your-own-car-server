import cloudinary from '../config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';

export const uploadImageToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file.buffer, folder)
  );

  const results = await Promise.all(uploadPromises);

  return results.map((result) => result.secure_url);
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];

  await cloudinary.uploader.destroy(publicId);
};

export const deleteMultipleFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  if (!imageUrls || imageUrls.length === 0) return;

  await Promise.all(imageUrls.map((url) => deleteFromCloudinary(url)));
};

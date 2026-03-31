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

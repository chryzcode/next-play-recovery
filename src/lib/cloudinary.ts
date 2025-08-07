import { v2 as cloudinary } from 'cloudinary';

// Parse Cloudinary URL to extract credentials
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  throw new Error('CLOUDINARY_URL environment variable is required');
}

// Extract credentials from URL
const url = new URL(cloudinaryUrl);
const cloudName = url.hostname.split('.')[0];
const apiKey = url.username;
const apiSecret = url.password;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;

export async function uploadImage(file: Buffer, folder: string = 'next-play-recovery'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    uploadStream.end(file);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
} 
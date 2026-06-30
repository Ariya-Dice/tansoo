import { v2 as cloudinary } from 'cloudinary';
import { isProductsWriteAuthorized, sendUnauthorized } from '../lib/apiAuth.js';

export const config = { runtime: 'nodejs' };

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);

  if (!isCloudinaryConfigured) {
    return res.status(503).json({
      error: 'Cloudinary not configured',
      message:
        'On Vercel you must set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    });
  }

  try {
    const { file, filename } = req.body ?? {};
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const base64Data = String(file).replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'products', resource_type: 'image' }, (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        })
        .end(buffer);
    });

    return res.status(200).json({
      filename: result.original_filename || filename || 'image',
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', message: error.message });
  }
}

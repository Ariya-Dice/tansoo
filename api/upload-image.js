// api/upload-image.js - Serverless Function for Vercel
// آپلود تصویر با Cloudinary یا Filestack یا ذخیره موقت

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// تنظیمات Cloudinary
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

// تنظیمات Filestack
const FILESTACK_API_KEY = process.env.FILESTACK_API_KEY;
const isFilestackEnabled = !!FILESTACK_API_KEY;

// مسیر پوشه موقت برای تصاویر
const TEMP_IMAGES_DIR = path.join(process.cwd(), 'public', 'product-images');

// اطمینان از وجود پوشه
if (!fs.existsSync(TEMP_IMAGES_DIR)) {
  fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
}

export default async function handler(req, res) {
  // تنظیم CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🖼️ POST /api/upload-image - Uploading image');

    // در Vercel، فایل‌ها از multipart/form-data می‌آیند
    // برای سادگی، از base64 encoding استفاده می‌کنیم که از client ارسال می‌شود
    const { file, filename, type } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // اگر Cloudinary تنظیم شده باشد
    if (isCloudinaryConfigured) {
      try {
        // تبدیل base64 به buffer
        let buffer;
        if (typeof file === 'string') {
          // حذف data URL prefix اگر وجود داشته باشد
          const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
          buffer = Buffer.from(base64Data, 'base64');
        } else if (Buffer.isBuffer(file)) {
          buffer = file;
        } else {
          throw new Error('Invalid file format');
        }

        // آپلود به Cloudinary
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'products',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                console.error('❌ Cloudinary upload error:', error);
                // Fallback به ذخیره موقت
                return handleTempUpload(req, res, buffer, filename)
                  .then(resolve)
                  .catch(reject);
              }
              
              console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
              resolve(
                res.status(200).json({
                  filename: result.original_filename || filename || 'image',
                  url: result.secure_url,
                })
              );
            }
          ).end(buffer);
        });
      } catch (err) {
        console.error('❌ Cloudinary upload error:', err);
        // Fallback به ذخیره موقت
        return handleTempUpload(req, res);
      }
    }

    // اگر Filestack فعال باشد
    if (isFilestackEnabled) {
      try {
        // TODO: پیاده‌سازی Filestack upload برای تصاویر
        // برای حال حاضر، از ذخیره موقت استفاده می‌کنیم
        return handleTempUpload(req, res);
      } catch (err) {
        console.error('❌ Filestack upload error:', err);
        return handleTempUpload(req, res);
      }
    }

    // Fallback: ذخیره موقت
    return handleTempUpload(req, res);
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
}

// ذخیره موقت فایل
async function handleTempUpload(req, res, buffer = null, providedFilename = null) {
  try {
    let fileBuffer = buffer;
    let filename = providedFilename;

    if (!fileBuffer) {
      const { file } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // تبدیل base64 به buffer
      if (typeof file === 'string') {
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
        fileBuffer = Buffer.from(base64Data, 'base64');
      } else if (Buffer.isBuffer(file)) {
        fileBuffer = file;
      } else {
        return res.status(400).json({ error: 'Invalid file format' });
      }
    }

    // ایجاد نام فایل منحصر به فرد
    if (!filename) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = '.png'; // پیش‌فرض
      filename = `prod-${uniqueSuffix}${ext}`;
    }

    const filepath = path.join(TEMP_IMAGES_DIR, filename);

    // ذخیره فایل
    fs.writeFileSync(filepath, fileBuffer);

    // برگرداندن URL نسبی
    const url = `/product-images/${filename}`;
    console.log('✅ Image saved to temp file:', url);
    
    return res.status(200).json({
      filename: filename,
      url: url,
    });
  } catch (error) {
    console.error('❌ Temp upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
}

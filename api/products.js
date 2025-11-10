// api/products.js - Serverless Function for Vercel
// مدیریت CRUD محصولات با Filestack یا JSON موقت

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تنظیمات Filestack
const FILESTACK_API_KEY = process.env.FILESTACK_API_KEY;
const FILESTACK_SECURITY = process.env.FILESTACK_SECURITY;
const FILESTACK_STORE_URL = process.env.FILESTACK_STORE_URL || 'https://www.filestackapi.com/api/store/S3';

// مسیر فایل JSON موقت (فقط برای fallback)
const TEMP_DB_PATH = path.join(process.cwd(), 'public', 'products.json');
const TEMP_IMAGES_DIR = path.join(process.cwd(), 'public', 'product-images');

// بررسی فعال بودن Filestack
const isFilestackEnabled = !!FILESTACK_API_KEY;

// Helper: خواندن محصولات از Filestack یا JSON موقت
async function readProducts() {
  if (isFilestackEnabled) {
    try {
      // استفاده از Filestack Content API برای خواندن فایل JSON
      const filestackUrl = `https://www.filestackapi.com/api/file/${FILESTACK_API_KEY}/products.json`;
      const response = await fetch(filestackUrl);
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } else {
        // اگر فایل وجود نداشت، از JSON موقت استفاده کنیم
        console.warn('⚠️ Filestack file not found, using temp file');
        return readFromTempFile();
      }
    } catch (err) {
      console.error('❌ Filestack read error:', err);
      // Fallback به JSON موقت
      return readFromTempFile();
    }
  }
  return readFromTempFile();
}

// خواندن از فایل JSON موقت
function readFromTempFile() {
  try {
    if (!fs.existsSync(TEMP_DB_PATH)) {
      // ایجاد فایل خالی اگر وجود نداشته باشد
      fs.writeFileSync(TEMP_DB_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(TEMP_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('❌ Error reading temp file:', err);
    return [];
  }
}

// Helper: نوشتن محصولات به Filestack یا JSON موقت
async function writeProducts(products) {
  // همیشه در فایل موقت بنویسیم (برای fallback)
  const tempWritten = writeToTempFile(products);
  
  if (isFilestackEnabled) {
    try {
      // تبدیل داده به JSON string و سپس به buffer
      const jsonData = JSON.stringify(products, null, 2);
      const buffer = Buffer.from(jsonData, 'utf8');
      
      // استفاده از Filestack REST API برای آپلود
      // ساخت multipart/form-data manually
      const boundary = '----WebKitFormBoundary' + Date.now();
      const formData = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="fileUpload"; filename="products.json"',
        'Content-Type: application/json',
        '',
        buffer.toString('utf8'),
        `--${boundary}`,
        'Content-Disposition: form-data; name="store"',
        '',
        JSON.stringify({ location: 's3' }),
        `--${boundary}--`
      ].join('\r\n');
      
      const uploadUrl = `https://www.filestackapi.com/api/store/S3?key=${FILESTACK_API_KEY}`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Products saved to Filestack:', result.url || 'Success');
        return true;
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Filestack upload failed:', errorText);
        return tempWritten;
      }
    } catch (err) {
      console.error('❌ Filestack write error:', err);
      // Fallback به JSON موقت
      return tempWritten;
    }
  }
  return tempWritten;
}

// نوشتن به فایل JSON موقت
function writeToTempFile(products) {
  try {
    // اطمینان از وجود پوشه
    const dir = path.dirname(TEMP_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEMP_DB_PATH, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Error writing temp file:', err);
    return false;
  }
}

// تبدیل کلید 'سبک' به 'تنه' برای سازگاری
function normalizeProductSpecs(product) {
  if (product.specs && product.specs['سبک'] !== undefined) {
    const { 'سبک': value, ...restSpecs } = product.specs;
    return {
      ...product,
      specs: {
        ...restSpecs,
        'تنه': value
      }
    };
  }
  return product;
}

export default async function handler(req, res) {
  // تنظیم CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: دریافت همه محصولات
    if (req.method === 'GET') {
      console.log('📋 GET /api/products - Fetching products');
      const products = await readProducts();
      // نرمال‌سازی محصولات
      const normalizedProducts = products.map(normalizeProductSpecs);
      return res.status(200).json(normalizedProducts);
    }

    // POST: افزودن محصول جدید
    if (req.method === 'POST') {
      console.log('➕ POST /api/products - Adding product:', req.body.name);
      const products = await readProducts();
      const newProduct = req.body;
      
      // ایجاد ID جدید
      newProduct.id = products.length > 0 
        ? Math.max(...products.map(p => p.id)) + 1 
        : 1;
      
      products.push(newProduct);
      await writeProducts(products);
      return res.status(201).json(newProduct);
    }

    // PUT: ویرایش محصول
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      console.log('✏️ PUT /api/products/' + id + ' - Updating product');
      const products = await readProducts();
      const productId = parseInt(id, 10);
      const index = products.findIndex(p => p.id === productId);

      if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      products[index] = { ...products[index], ...req.body, id: productId };
      await writeProducts(products);
      return res.status(200).json(products[index]);
    }

    // DELETE: حذف محصول
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      console.log('🗑️ DELETE /api/products/' + id + ' - Deleting product');
      let products = await readProducts();
      const productId = parseInt(id, 10);
      const countBefore = products.length;
      products = products.filter(p => p.id !== productId);

      if (products.length === countBefore) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await writeProducts(products);
      return res.status(200).json({ success: true });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}


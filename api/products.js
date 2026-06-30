import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStorageMode,
} from '../lib/productsRepository.js';
import { isProductsWriteAuthorized, sendUnauthorized } from '../lib/apiAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isWrite = req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE';
  if (isWrite && !isProductsWriteAuthorized(req)) {
    return sendUnauthorized(res);
  }

  try {
    if (req.method === 'GET') {
      const products = await getAllProducts();
      res.setHeader('X-Storage-Mode', getStorageMode());
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const newProduct = await createProduct(req.body);
      res.setHeader('X-Storage-Mode', getStorageMode());
      return res.status(201).json(newProduct);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      const updated = await updateProduct(parseInt(id, 10), req.body);
      res.setHeader('X-Storage-Mode', getStorageMode());
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      await deleteProduct(parseInt(id, 10));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API Error:', error);
    const msg = error.message || 'Internal server error';
    const isConfig =
      msg.includes('not configured') ||
      msg.includes('Supabase') ||
      msg.includes('schema.sql');
    const status =
      error.message === 'Product not found' ? 404 : isConfig ? 503 : 500;
    return res.status(status).json({
      error: status === 404 ? 'Product not found' : isConfig ? 'Service unavailable' : 'Internal server error',
      message: msg,
    });
  }
}

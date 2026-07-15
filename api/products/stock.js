import { adjustProductStock, getStorageMode } from '../../../lib/productsRepository.js';
import { isProductsWriteAuthorized, sendUnauthorized } from '../../../lib/apiAuth.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isProductsWriteAuthorized(req)) {
    return sendUnauthorized(res);
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await adjustProductStock(parseInt(String(id), 10), req.body ?? {});
    res.setHeader('X-Storage-Mode', getStorageMode());
    return res.status(200).json(product);
  } catch (error) {
    console.error('Stock adjust error:', error);
    const msg = error.message || 'Internal server error';
    const status =
      error.message === 'Product not found' ? 404 :
      msg.includes('stock') || msg.includes('delta') ? 400 : 500;
    return res.status(status).json({
      error: status === 404 ? 'Product not found' : 'Stock update failed',
      message: msg,
    });
  }
}

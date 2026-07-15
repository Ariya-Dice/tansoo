import { fulfillOrder } from '../../lib/productsRepository.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body ?? {};
    const result = await fulfillOrder(items);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Fulfill order error:', error);
    const msg = error.message || 'Internal server error';
    const isClient =
      msg.includes('stock') ||
      msg.includes('items') ||
      msg.includes('productId') ||
      msg.includes('quantity') ||
      msg.includes('not found');
    return res.status(isClient ? 400 : 500).json({
      error: isClient ? 'Order fulfillment failed' : 'Internal server error',
      message: msg,
    });
  }
}

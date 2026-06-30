import { bulkAdjustPrices } from '../../lib/productsRepository.js';
import { isProductsWriteAuthorized, sendUnauthorized } from '../../lib/apiAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isProductsWriteAuthorized(req)) return sendUnauthorized(res);

  try {
    const { percent, goodsType } = req.body ?? {};
    const result = await bulkAdjustPrices(percent, { goodsType });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

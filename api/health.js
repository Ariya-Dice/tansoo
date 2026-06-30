import { verifyDatabaseConnection, getStorageMode } from '../lib/productsRepository.js';

export const config = { runtime: 'nodejs' };

export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const status = await verifyDatabaseConnection();
    return res.status(200).json({
      ok: true,
      mode: getStorageMode(),
      productCount: status.productCount ?? null,
    });
  } catch (err) {
    return res.status(503).json({ ok: false, error: err.message });
  }
}

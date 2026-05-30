/**
 * Import products from db/products.json into Supabase.
 * Usage: node scripts/seed-from-json.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { productToRow, normalizeLegacyRow } from '../lib/productMapper.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '..', 'db', 'products.json');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const products = raw.map(normalizeLegacyRow);

for (const product of products) {
  const { error } = await supabase.from('products').upsert(productToRow(product), {
    onConflict: 'id',
  });
  if (error) {
    console.error(`Failed id=${product.id}:`, error.message);
  } else {
    console.log(`✅ Upserted product #${product.id}`);
  }
}

console.log('Done.');

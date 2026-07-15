import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { rowToProduct, productToRow } from './productMapper.js';
import { validateProductInput, validateStockAdjustPayload } from './productValidation.js';
import { validateFulfillmentItems } from './stockValidation.js';
import { resolveSupabaseConfig } from './supabaseConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const IS_SERVERLESS = Boolean(process.env.VERCEL);

/** @type {{ url: string | null, key: string | null, serviceKey: string | null, anonKey: string | null }} */
let supabaseConfig = { url: null, key: null, serviceKey: null, anonKey: null };

try {
  if (process.env.SUPABASE_URL?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    supabaseConfig = resolveSupabaseConfig();
  }
} catch (err) {
  if (IS_SERVERLESS) throw err;
  console.warn(`⚠️ Supabase config: ${err.message}`);
}

const supabaseUrl = supabaseConfig.url;
const supabaseKey = supabaseConfig.key;
const supabaseServiceKey = supabaseConfig.serviceKey;

export const useDatabase = Boolean(supabaseUrl && supabaseKey);
export const useSqlite = !useDatabase && !IS_SERVERLESS;

/** Lazy-load SQLite only on local server (never on Vercel). */
async function sqlite() {
  return import('./sqliteStore.js');
}

const supabase = useDatabase ? createClient(supabaseUrl, supabaseKey) : null;

function formatSupabaseHint(message) {
  if (message.includes('Invalid path') || message.includes('Invalid API key')) {
    return ' — Fix SUPABASE_URL (https://xxxxx.supabase.co) and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then Redeploy.';
  }
  return '';
}

function assertStorageAvailable() {
  if (useDatabase || useSqlite) return;
  if (IS_SERVERLESS) {
    throw new Error(
      'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.',
    );
  }
  throw new Error(
    'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, or run locally to use SQLite (db/products.db).',
  );
}

export function getStorageMode() {
  if (useDatabase) return 'supabase';
  if (useSqlite) return 'sqlite';
  return 'none';
}

if (useDatabase && !supabaseServiceKey) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY is not set — using SUPABASE_ANON_KEY. Prefer the service role key for admin writes.',
  );
}

/** Verify DB connectivity at startup / in tests */
export async function verifyDatabaseConnection() {
  if (useDatabase) {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      const hint =
        error.message.includes('Invalid path') || error.message.includes('fetch failed')
          ? ' Check SUPABASE_URL is exactly https://YOUR-REF.supabase.co (Settings → API → Project URL).'
          : '';
      throw new Error(
        `Supabase connection failed: ${error.message}.${hint} Run supabase/schema.sql if the table is missing.`,
      );
    }
    return { mode: 'supabase', ok: true };
  }

  if (useSqlite) {
    const { verifySqliteConnection, sqliteGetAllProducts } = await sqlite();
    await verifySqliteConnection();
    const products = await sqliteGetAllProducts();
    return { mode: 'sqlite', ok: true, productCount: products.length };
  }

  assertStorageAvailable();
  return { mode: 'none', ok: false };
}

/** @returns {Promise<Product[]>} */
export async function getAllProducts() {
  assertStorageAvailable();

  if (useDatabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new Error(`Database read failed: ${error.message}${formatSupabaseHint(error.message)}`);
    return (data ?? []).map(rowToProduct);
  }

  return await (await sqlite()).sqliteGetAllProducts();
}

/** @param {Omit<import('../src/types.ts').Product, 'id'>} product */
export async function createProduct(product) {
  assertStorageAvailable();
  validateProductInput(product);

  if (useDatabase) {
    const { data, error } = await supabase
      .from('products')
      .insert(productToRow(product))
      .select('*')
      .single();

    if (error) throw new Error(`Database insert failed: ${error.message}`);
    return rowToProduct(data);
  }

  return await (await sqlite()).sqliteCreateProduct(product);
}

/** @param {number} id @param {Partial<import('../src/types.ts').Product>} updates */
export async function updateProduct(id, updates) {
  assertStorageAvailable();
  validateProductInput(updates, { partial: true });

  if (useDatabase) {
    const { data, error } = await supabase
      .from('products')
      .update(productToRow(updates, { partial: true }))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Database update failed: ${error.message}`);
    if (!data) throw new Error('Product not found');
    return rowToProduct(data);
  }

  return await (await sqlite()).sqliteUpdateProduct(id, updates);
}

/** @param {number} id */
export async function deleteProduct(id) {
  assertStorageAvailable();

  if (useDatabase) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw new Error(`Database delete failed: ${error.message}`);
    if (!data?.length) throw new Error('Product not found');
    return { success: true };
  }

  return await (await sqlite()).sqliteDeleteProduct(id);
}

/**
 * Adjust prices by percentage for all or filtered products.
 * @param {number} percent positive = increase, negative = decrease
 * @param {{ goodsType?: string }} [filter]
 */
export async function bulkAdjustPrices(percent, { goodsType } = {}) {
  assertStorageAvailable();
  const num = Number(percent);
  if (!Number.isFinite(num)) {
    throw new Error('percent must be a valid number');
  }

  const products = await getAllProducts();
  const factor = 1 + num / 100;
  let updated = 0;

  for (const p of products) {
    const type = p.goodsType || p.type || '';
    if (goodsType && goodsType !== 'all' && type !== goodsType) continue;

    const newPrice = Math.max(0, Math.round(p.price * factor));
    if (newPrice === p.price) continue;

    await updateProduct(p.id, { price: newPrice });
    updated += 1;
  }

  return { updated, percent: num, goodsType: goodsType || 'all' };
}

/**
 * Deduct stock for a customer order (server-side, atomic where possible).
 * @param {Array<{ productId?: unknown; quantity?: unknown }>} items
 */
export async function fulfillOrder(items) {
  assertStorageAvailable();
  const normalized = validateFulfillmentItems(items);

  if (useDatabase) {
    /** @type {Record<number, number>} */
    const required = {};
    for (const { productId, quantity } of normalized) {
      required[productId] = (required[productId] ?? 0) + quantity;
    }

    /** @type {import('../src/types.ts').Product[]} */
    const updatedProducts = [];

    for (const [productIdStr, quantity] of Object.entries(required)) {
      const productId = Number(productIdStr);
      const { data: current, error: readError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (readError || !current) {
        throw new Error(`Product not found: ${productId}`);
      }

      const currentStock = Number(current.stock ?? 0);
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for product ${productId}`);
      }

      const nextStock = currentStock - quantity;
      const { data, error } = await supabase
        .from('products')
        .update({ stock: nextStock })
        .eq('id', productId)
        .eq('stock', currentStock)
        .select('*')
        .maybeSingle();

      if (error || !data) {
        throw new Error(`Stock update conflict for product ${productId}. Please retry.`);
      }

      updatedProducts.push(rowToProduct(data));
    }

    return { success: true, products: updatedProducts };
  }

  const products = await (await sqlite()).sqliteFulfillOrder(normalized);
  return { success: true, products };
}

/**
 * Admin-only stock adjustment.
 * @param {number} id
 * @param {{ stock?: unknown; delta?: unknown }} payload
 */
export async function adjustProductStock(id, payload) {
  assertStorageAvailable();
  const adjustment = validateStockAdjustPayload(payload);

  if (useDatabase) {
    const { data: current, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (readError || !current) throw new Error('Product not found');

    const currentStock = Number(current.stock ?? 0);
    const nextStock =
      adjustment.mode === 'set'
        ? adjustment.value
        : currentStock + adjustment.value;

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      throw new Error('stock must be a non-negative integer');
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(`Stock update failed: ${error.message}`);
    if (!data) throw new Error('Product not found');
    return rowToProduct(data);
  }

  return await (await sqlite()).sqliteAdjustProductStock(id, adjustment);
}

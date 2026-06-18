import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { rowToProduct, productToRow } from './productMapper.js';
import { validateProductInput } from './productValidation.js';
import {
  verifySqliteConnection,
  sqliteGetAllProducts,
  sqliteCreateProduct,
  sqliteUpdateProduct,
  sqliteDeleteProduct,
} from './sqliteStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const IS_SERVERLESS = Boolean(process.env.VERCEL);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

export const useDatabase = Boolean(supabaseUrl && supabaseKey);
export const useSqlite = !useDatabase && !IS_SERVERLESS;

const supabase = useDatabase ? createClient(supabaseUrl, supabaseKey) : null;

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
      throw new Error(
        `Supabase connection failed: ${error.message}. Run supabase/schema.sql in your Supabase SQL editor.`,
      );
    }
    return { mode: 'supabase', ok: true };
  }

  if (useSqlite) {
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

    if (error) throw new Error(`Database read failed: ${error.message}`);
    return (data ?? []).map(rowToProduct);
  }

  return await sqliteGetAllProducts();
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

  return await sqliteCreateProduct(product);
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

  return await sqliteUpdateProduct(id, updates);
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

  return await sqliteDeleteProduct(id);
}

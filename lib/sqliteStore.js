import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { rowToProduct, productToRow, normalizeLegacyRow } from './productMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'db', 'products.db');
const JSON_LEGACY_PATH = path.join(__dirname, '..', 'db', 'products.json');

/** @type {import('better-sqlite3').Database | null} */
let db = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    body_weight TEXT NOT NULL DEFAULT '',
    hose_material TEXT,
    valve_material TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    price INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
`;

function parseTags(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** @param {Record<string, unknown>} row */
function sqliteRowToProduct(row) {
  return rowToProduct({
    ...row,
    tags: parseTags(row.tags),
  });
}

function migrateLegacyJson(database) {
  if (!fs.existsSync(JSON_LEGACY_PATH)) return 0;

  const count = /** @type {{ c: number }} */ (
    database.prepare('SELECT COUNT(*) AS c FROM products').get()
  ).c;
  if (count > 0) return 0;

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(JSON_LEGACY_PATH, 'utf8'));
  } catch {
    return 0;
  }
  if (!Array.isArray(raw) || raw.length === 0) return 0;

  const insert = database.prepare(`
    INSERT INTO products (
      model, type, color, body_weight, hose_material, valve_material,
      tags, price, description, image
    ) VALUES (
      @model, @type, @color, @body_weight, @hose_material, @valve_material,
      @tags, @price, @description, @image
    )
  `);

  let migrated = 0;
  const tx = database.transaction((rows) => {
    for (const row of rows) {
      const product = normalizeLegacyRow(row);
      const mapped = productToRow(product);
      insert.run({
        ...mapped,
        tags: JSON.stringify(mapped.tags ?? []),
      });
      migrated += 1;
    }
  });
  tx(raw);
  console.log(`✅ Migrated ${migrated} products from db/products.json → SQLite`);
  return migrated;
}

export function getSqliteDb() {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  migrateLegacyJson(db);
  return db;
}

export function closeSqliteDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function verifySqliteConnection() {
  const database = getSqliteDb();
  database.prepare('SELECT 1 AS ok').get();
  return true;
}

/** @returns {import('../src/types').Product[]} */
export function sqliteGetAllProducts() {
  const database = getSqliteDb();
  const rows = database
    .prepare('SELECT * FROM products ORDER BY id ASC')
    .all();
  return rows.map((row) => sqliteRowToProduct(row));
}

/** @param {Omit<import('../src/types').Product, 'id'>} product */
export function sqliteCreateProduct(product) {
  const database = getSqliteDb();
  const row = productToRow(product);
  const stmt = database.prepare(`
    INSERT INTO products (
      model, type, color, body_weight, hose_material, valve_material,
      tags, price, description, image
    ) VALUES (
      @model, @type, @color, @body_weight, @hose_material, @valve_material,
      @tags, @price, @description, @image
    )
  `);
  const result = stmt.run({
    ...row,
    tags: JSON.stringify(row.tags ?? []),
  });
  return sqliteRowToProduct(
    database.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid),
  );
}

/** @param {number} id @param {Partial<import('../src/types').Product>} updates */
export function sqliteUpdateProduct(id, updates) {
  const database = getSqliteDb();
  const existing = database.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) throw new Error('Product not found');

  const row = productToRow(updates, { partial: true });
  const entries = Object.entries(row);
  if (entries.length === 0) return sqliteRowToProduct(existing);

  const setClause = entries.map(([key]) => `${key} = @${key}`).join(', ');
  const params = { id };
  for (const [key, value] of entries) {
    params[key] = key === 'tags' ? JSON.stringify(value ?? []) : value;
  }

  database.prepare(`UPDATE products SET ${setClause} WHERE id = @id`).run(params);
  return sqliteRowToProduct(
    database.prepare('SELECT * FROM products WHERE id = ?').get(id),
  );
}

/** @param {number} id */
export function sqliteDeleteProduct(id) {
  const database = getSqliteDb();
  const result = database.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (result.changes === 0) throw new Error('Product not found');
  return { success: true };
}

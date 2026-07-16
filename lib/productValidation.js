import { parseStockDelta, parseStockValue } from './stockValidation.js';

const MAX_BRAND_LENGTH = 100;

/**
 * @param {unknown} value
 * @returns {string}
 */
export function parseBrand(value) {
  const brand = String(value ?? '').trim();
  if (brand.length > MAX_BRAND_LENGTH) {
    throw new Error(`brand must be at most ${MAX_BRAND_LENGTH} characters`);
  }
  return brand;
}

/** @param {Record<string, unknown>} product */
export function validateProductInput(product, { partial = false } = {}) {
  const errors = [];

  if (!partial || product.brand !== undefined) {
    try {
      parseBrand(product.brand);
    } catch {
      errors.push('brand is invalid');
    }
  }

  if (!partial || product.price !== undefined) {
    const price = Number(product.price ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  if (!partial || product.stock !== undefined) {
    try {
      parseStockValue(product.stock ?? 0);
    } catch {
      errors.push('stock must be a non-negative integer');
    }
  }

  if (errors.length) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

/** @param {{ stock?: unknown; delta?: unknown }} payload */
export function validateStockAdjustPayload(payload) {
  const hasStock = payload.stock !== undefined;
  const hasDelta = payload.delta !== undefined;

  if (hasStock === hasDelta) {
    throw new Error('Provide exactly one of stock or delta');
  }

  if (hasStock) {
    return { mode: 'set', value: parseStockValue(payload.stock) };
  }

  return { mode: 'delta', value: parseStockDelta(payload.delta) };
}

const MAX_STOCK = 1_000_000;
const MAX_ORDER_QTY = 999;

/**
 * @param {unknown} value
 * @returns {number}
 */
export function parseStockValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error('stock must be an integer');
  }
  if (n < 0 || n > MAX_STOCK) {
    throw new Error(`stock must be between 0 and ${MAX_STOCK}`);
  }
  return n;
}

/**
 * @param {unknown} value
 * @returns {number}
 */
export function parseStockDelta(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0) {
    throw new Error('delta must be a non-zero integer');
  }
  if (Math.abs(n) > MAX_STOCK) {
    throw new Error('delta out of allowed range');
  }
  return n;
}

/**
 * @param {Array<{ productId?: unknown; quantity?: unknown }>} items
 */
export function validateFulfillmentItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items array is required');
  }
  if (items.length > 100) {
    throw new Error('too many line items');
  }

  /** @type {{ productId: number; quantity: number }[]} */
  const normalized = [];

  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isFinite(productId) || productId <= 0 || !Number.isInteger(productId)) {
      throw new Error('invalid productId');
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity) || quantity > MAX_ORDER_QTY) {
      throw new Error('invalid quantity');
    }
    normalized.push({ productId, quantity });
  }

  return normalized;
}

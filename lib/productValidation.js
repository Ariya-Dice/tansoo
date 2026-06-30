/** @param {Record<string, unknown>} product */
export function validateProductInput(product, { partial = false } = {}) {
  const errors = [];

  if (!partial || product.price !== undefined) {
    const price = Number(product.price ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  if (errors.length) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

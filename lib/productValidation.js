/** @param {Record<string, unknown>} product */
export function validateProductInput(product, { partial = false } = {}) {
  const errors = [];

  if (!partial || product.model !== undefined) {
    if (!product.model || String(product.model).trim() === '') {
      errors.push('model is required');
    }
  }
  if (!partial || product.type !== undefined) {
    if (!product.type || String(product.type).trim() === '') {
      errors.push('type is required');
    }
  }
  if (!partial || product.color !== undefined) {
    if (!product.color || String(product.color).trim() === '') {
      errors.push('color is required');
    }
  }
  if (!partial || product.bodyWeight !== undefined) {
    if (!product.bodyWeight || String(product.bodyWeight).trim() === '') {
      errors.push('bodyWeight is required');
    }
  }
  if (!partial || product.price !== undefined) {
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  if (errors.length) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

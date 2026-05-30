/** @typedef {import('../src/types').Product} Product */

/**
 * @param {Record<string, unknown>} row
 * @returns {Product}
 */
export function rowToProduct(row) {
  return {
    id: Number(row.id),
    model: String(row.model ?? ''),
    type: String(row.type ?? ''),
    color: String(row.color ?? ''),
    bodyWeight: String(row.body_weight ?? row.bodyWeight ?? ''),
    hoseMaterial: row.hose_material ?? row.hoseMaterial ?? undefined,
    valveMaterial: row.valve_material ?? row.valveMaterial ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    price: Number(row.price ?? 0),
    description: String(row.description ?? ''),
    image: String(row.image ?? ''),
  };
}

/**
 * Normalize legacy JSON rows (name/category/images) to Product shape.
 * @param {Record<string, unknown>} row
 * @returns {Product}
 */
export function normalizeLegacyRow(row) {
  if (row.model != null && String(row.model).trim() !== '') {
    return rowToProduct(row);
  }

  const images = /** @type {Record<string, string>} */ (row.images ?? {});
  const firstImage =
    Object.values(images).find((v) => v && String(v).trim() !== '') ||
    String(row.image ?? '');

  const specs = /** @type {Record<string, string>} */ (row.specs ?? {});
  const type = String(row.type ?? 'روشویی');

  return {
    id: Number(row.id),
    model: String(row.category ?? row.name ?? 'سایر').replace(/^شیرآلات\s*/u, ''),
    type,
    color: Object.keys(images).find((k) => images[k]) || String(row.color ?? 'کروم'),
    bodyWeight: String(specs['تنه'] ?? specs['سبک'] ?? row.bodyWeight ?? 'سبک'),
    hoseMaterial:
      type === 'روشویی' || type === 'سینک'
        ? String(row.hoseMaterial ?? 'آلومینیوم')
        : undefined,
    valveMaterial:
      type === 'آفتابه' || type === 'دوش' || type === 'دوش حمام'
        ? String(row.valveMaterial ?? 'برنجی')
        : undefined,
    tags: Array.isArray(row.tags)
      ? row.tags
      : [
          ...(row.isNew ? ['جدید'] : []),
          ...(row.isBestSeller ? ['پرفروش'] : []),
        ],
    price: Number(row.price ?? 0),
    description: String(row.description ?? ''),
    image: String(firstImage),
  };
}

/**
 * @param {Omit<Product, 'id'> | Partial<Product>} product
 * @param {{ partial?: boolean }} [options]
 * @returns {Record<string, unknown>}
 */
export function productToRow(product, { partial = false } = {}) {
  /** @type {[keyof Product, string, (v: unknown) => unknown][]} */
  const mapping = [
    ['model', 'model', (v) => v],
    ['type', 'type', (v) => v],
    ['color', 'color', (v) => v],
    ['bodyWeight', 'body_weight', (v) => v],
    ['hoseMaterial', 'hose_material', (v) => v ?? null],
    ['valveMaterial', 'valve_material', (v) => v ?? null],
    ['tags', 'tags', (v) => v ?? []],
    ['price', 'price', (v) => v ?? 0],
    ['description', 'description', (v) => v ?? ''],
    ['image', 'image', (v) => v ?? ''],
  ];

  /** @type {Record<string, unknown>} */
  const row = {};

  for (const [src, dest, transform] of mapping) {
    if (partial && product[src] === undefined) continue;
    row[dest] = transform(product[src]);
  }

  if (product.id != null) row.id = product.id;
  return row;
}

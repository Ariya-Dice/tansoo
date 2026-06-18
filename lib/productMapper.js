/** @typedef {import('../src/types').Product} Product */

/**
 * @param {Record<string, unknown>} row
 * @returns {Product}
 */
export function rowToProduct(row) {
  const goodsType = String(row.goods_type ?? row.goodsType ?? row.type ?? '');
  return {
    id: Number(row.id),
    model: String(row.model ?? ''),
    goodsType,
    type: goodsType,
    color: String(row.color ?? ''),
    bodyMaterial: row.body_material ?? row.bodyMaterial ?? undefined,
    handleMaterial: row.handle_material ?? row.handleMaterial ?? undefined,
    bodyWeight: String(row.body_weight ?? row.bodyWeight ?? ''),
    packageWeight: row.package_weight ?? row.packageWeight ?? undefined,
    cartridgeSize: row.cartridge_size ?? row.cartridgeSize ?? undefined,
    cartridgeNutMaterial: row.cartridge_nut_material ?? row.cartridgeNutMaterial ?? undefined,
    leftHandedNut: row.left_handed_nut ?? row.leftHandedNut ?? undefined,
    hotColdOutput: row.hot_cold_output ?? row.hotColdOutput ?? undefined,
    packageDimensions: row.package_dimensions ?? row.packageDimensions ?? undefined,
    postalHose: row.postal_hose ?? row.postalHose ?? undefined,
    escutcheon: row.escutcheon ?? undefined,
    valveMaterial: row.valve_material ?? row.valveMaterial ?? undefined,
    spoutMaterial: row.spout_material ?? row.spoutMaterial ?? undefined,
    platorMaterial: row.plator_material ?? row.platorMaterial ?? undefined,
    hoseMaterial: row.hose_material ?? row.hoseMaterial ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    price: Number(row.price ?? 0),
    description: String(row.description ?? ''),
    image: String(row.image ?? ''),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Product}
 */
export function normalizeLegacyRow(row) {
  if (row.model != null && String(row.model).trim() !== '') {
    const product = rowToProduct(row);
    if (!product.goodsType && row.type) {
      product.goodsType = String(row.type);
      product.type = product.goodsType;
    }
    return product;
  }

  const images = /** @type {Record<string, string>} */ (row.images ?? {});
  const firstImage =
    Object.values(images).find((v) => v && String(v).trim() !== '') ||
    String(row.image ?? '');

  const specs = /** @type {Record<string, string>} */ (row.specs ?? {});
  const legacyType = String(row.type ?? 'شیر روشویی');

  return {
    id: Number(row.id),
    model: String(row.category ?? row.name ?? 'سایر').replace(/^شیرآلات\s*/u, ''),
    goodsType: legacyType,
    type: legacyType,
    color: Object.keys(images).find((k) => images[k]) || String(row.color ?? 'کروم'),
    bodyWeight: String(specs['تنه'] ?? specs['سبک'] ?? row.bodyWeight ?? ''),
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
  const goodsType = product.goodsType ?? product.type ?? '';

  /** @type {[keyof Product, string, (v: unknown) => unknown][]} */
  const mapping = [
    ['model', 'model', (v) => v],
    ['goodsType', 'goods_type', () => goodsType],
    ['color', 'color', (v) => v],
    ['bodyMaterial', 'body_material', (v) => v ?? null],
    ['handleMaterial', 'handle_material', (v) => v ?? null],
    ['bodyWeight', 'body_weight', (v) => v],
    ['packageWeight', 'package_weight', (v) => v ?? null],
    ['cartridgeSize', 'cartridge_size', (v) => v ?? null],
    ['cartridgeNutMaterial', 'cartridge_nut_material', (v) => v ?? null],
    ['leftHandedNut', 'left_handed_nut', (v) => v ?? null],
    ['hotColdOutput', 'hot_cold_output', (v) => v ?? null],
    ['packageDimensions', 'package_dimensions', (v) => v ?? null],
    ['postalHose', 'postal_hose', (v) => v ?? null],
    ['escutcheon', 'escutcheon', (v) => v ?? null],
    ['valveMaterial', 'valve_material', (v) => v ?? null],
    ['spoutMaterial', 'spout_material', (v) => v ?? null],
    ['platorMaterial', 'plator_material', (v) => v ?? null],
    ['tags', 'tags', (v) => v ?? []],
    ['price', 'price', (v) => v ?? 0],
    ['description', 'description', (v) => v ?? ''],
    ['image', 'image', (v) => v ?? ''],
  ];

  /** @type {Record<string, unknown>} */
  const row = {};

  for (const [src, dest, transform] of mapping) {
    if (partial && product[src] === undefined && src !== 'goodsType') continue;
    row[dest] = transform(product[src]);
  }

  // سازگاری با ستون type قدیمی
  if (!partial || product.goodsType !== undefined || product.type !== undefined) {
    row.type = goodsType;
  }

  if (product.id != null) row.id = product.id;
  return row;
}

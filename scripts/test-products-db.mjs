/**
 * Integration test: product CRUD against Supabase or local SQLite.
 * Usage: node scripts/test-products-db.mjs
 */
import {
  verifyDatabaseConnection,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStorageMode,
} from '../lib/productsRepository.js';

const TEST_MODEL = `__test_${Date.now()}__`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('🧪 Product database test\n');

  const conn = await verifyDatabaseConnection();
  console.log(`✅ Connected (${conn.mode}) — existing products: ${conn.productCount ?? 'n/a'}`);
  assert(getStorageMode() === conn.mode, 'Storage mode mismatch');

  const beforeCount = (await getAllProducts()).length;

  const created = await createProduct({
    model: TEST_MODEL,
    goodsType: 'شیر روشویی',
    type: 'شیر روشویی',
    color: 'کروم',
    bodyWeight: '600 گرم',
    bodyMaterial: 'آلیاژ برنج',
    tags: ['جدید'],
    price: 999001,
    description: 'test product — safe to delete',
    image: '',
  });
  console.log(`✅ CREATE id=${created.id} model=${created.model}`);
  assert(created.model === TEST_MODEL, 'Created model mismatch');
  assert(created.price === 999001, 'Created price mismatch');

  const afterCreate = await getAllProducts();
  assert(afterCreate.length === beforeCount + 1, 'Product count after create');

  const updated = await updateProduct(created.id, {
    price: 999002,
    description: 'updated test product',
  });
  console.log(`✅ UPDATE id=${updated.id} price=${updated.price}`);
  assert(updated.price === 999002, 'Updated price mismatch');
  assert(updated.model === TEST_MODEL, 'Model should be unchanged after partial update');

  await deleteProduct(created.id);
  console.log(`✅ DELETE id=${created.id}`);

  const afterDelete = await getAllProducts();
  assert(afterDelete.length === beforeCount, 'Product count after delete');
  assert(!afterDelete.some((p) => p.id === created.id), 'Deleted product still in list');

  console.log('\n✅ All database tests passed (' + conn.mode + ')');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});

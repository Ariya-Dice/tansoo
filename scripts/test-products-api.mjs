/**
 * HTTP integration test against local API (must be running on port 4020).
 * Usage: node scripts/test-products-api.mjs
 */
const BASE = 'http://localhost:4020';
const TEST_MODEL = `__api_test_${Date.now()}__`;
const secret = process.env.PRODUCTS_API_SECRET;

function headers(json = false) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (secret) h['X-Api-Secret'] = secret;
  return h;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('🧪 Product API HTTP test\n');

  const health = await fetch(`${BASE}/api/products`);
  assert(health.ok, `GET /api/products failed: ${health.status}`);
  const mode = health.headers.get('X-Storage-Mode');
  console.log(`✅ API reachable — storage: ${mode}`);
  const before = await health.json();

  const createRes = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({
      model: TEST_MODEL,
      type: 'شیر روشویی',
      goodsType: 'شیر روشویی',
      color: 'کروم',
      bodyWeight: '600 گرم',
      tags: [],
      price: 888001,
      description: 'api test',
      image: '',
    }),
  });
  if (!createRes.ok) {
    throw new Error(`POST failed: ${createRes.status} ${await createRes.text()}`);
  }
  const created = await createRes.json();
  console.log(`✅ POST id=${created.id}`);

  const updateRes = await fetch(`${BASE}/api/products?id=${created.id}`, {
    method: 'PUT',
    headers: headers(true),
    body: JSON.stringify({ price: 888002 }),
  });
  if (!updateRes.ok) {
    throw new Error(`PUT failed: ${updateRes.status} ${await updateRes.text()}`);
  }
  const updated = await updateRes.json();
  assert(updated.price === 888002, 'PUT price mismatch');
  console.log(`✅ PUT price=${updated.price}`);

  const deleteRes = await fetch(`${BASE}/api/products?id=${created.id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!deleteRes.ok) {
    throw new Error(`DELETE failed: ${deleteRes.status} ${await deleteRes.text()}`);
  }
  console.log(`✅ DELETE id=${created.id}`);

  const afterRes = await fetch(`${BASE}/api/products`);
  const after = await afterRes.json();
  assert(after.length === before.length, 'Count restored after delete');

  console.log('\n✅ All API tests passed');
}

run().catch((err) => {
  console.error('\n❌ API test failed:', err.message);
  console.error('   Start the API first: npm run dev:api');
  process.exit(1);
});

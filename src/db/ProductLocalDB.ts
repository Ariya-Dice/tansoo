const API = 'http://localhost:4020/products';
const IMG_API = 'http://localhost:4020/upload-image';
const IMG_HOST = 'http://localhost:4020/product-images/';

export async function fetchProducts() {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`خطا در دریافت محصولات: ${res.status}`);
  return await res.json();
}

export async function addProduct(product: any) {
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
  if (!res.ok) throw new Error(`خطا در افزودن محصول: ${res.status}`);
  return await res.json();
}

export async function updateProduct(id: number, product: any) {
  const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
  if (!res.ok) throw new Error(`خطا در ویرایش محصول: ${res.status}`);
  return await res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`خطا در حذف محصول: ${res.status}`);
  return await res.json();
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(IMG_API, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`خطا در آپلود تصویر: ${res.status}`);
  return await res.json();
}

export function imageUrl(filename: string) {
  return filename ? IMG_HOST + filename : '';
}

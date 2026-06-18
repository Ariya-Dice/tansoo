import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Product } from "../../types";
import { MODELS, TAGS, getDefaultImage } from "../../constants";
import {
  PRODUCT_SPEC_FIELDS,
  emptyProduct,
  getProductGoodsType,
} from "../../productSpecs";
import "./AdminProductsPage.css";

const AdminProductsPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getImage,
    showToast,
    loading,
  } = useAppContext();

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>(emptyProduct());
  const [editId, setEditId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'model' | 'price' | 'tags'>('model');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [customModel, setCustomModel] = useState("");

  const resetForm = () => {
    setNewProduct(emptyProduct());
    setEditId(null);
    setCustomModel("");
  };

  const updateField = <K extends keyof Omit<Product, "id">>(
    key: K,
    value: Omit<Product, "id">[K],
  ) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const apiSecret = import.meta.env.VITE_PRODUCTS_API_SECRET;
      if (apiSecret) uploadHeaders["X-Api-Secret"] = apiSecret;

      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: uploadHeaders,
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          type: file.type,
        }),
      });

      if (!res.ok) throw new Error("خطا در آپلود تصویر");

      const data = await res.json();
      updateField("image", data.url || data.filename);
      showToast("تصویر با موفقیت آپلود شد ✅");
    } catch (err) {
      console.error("❌ Upload error:", err);
      showToast("خطا در آپلود تصویر ❌");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.model || !newProduct.goodsType || !newProduct.color || !newProduct.bodyWeight || !newProduct.price) {
      showToast("لطفاً فیلدهای الزامی (مدل، نوع کالا، رنگ، وزن تنه، قیمت) را پر کنید ❌");
      return;
    }

    setSaving(true);
    try {
      const productToSave = {
        ...newProduct,
        type: newProduct.goodsType,
        image: newProduct.image || (newProduct.model ? getDefaultImage(newProduct.model) : ''),
      };

      if (editId) {
        await updateProduct(editId, productToSave);
      } else {
        await addProduct(productToSave);
      }
      resetForm();
    } catch (err) {
      console.error("❌ Error saving product:", err);
      showToast("خطا در ذخیره محصول ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("آیا از حذف محصول مطمئن هستید؟")) {
      await deleteProduct(id);
    }
  };

  const handleEdit = (p: Product) => {
    setNewProduct({
      ...emptyProduct(),
      ...p,
      goodsType: getProductGoodsType(p),
      type: getProductGoodsType(p),
    });
    setEditId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTag = (tag: string) => {
    setNewProduct((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'model') comparison = a.model.localeCompare(b.model, 'fa');
    else if (sortBy === 'price') comparison = a.price - b.price;
    else if (sortBy === 'tags') comparison = a.tags.join('').localeCompare(b.tags.join(''), 'fa');
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const previewImage = newProduct.image
    ? getImage(newProduct.image)
    : (newProduct.model ? getDefaultImage(newProduct.model) : '/loading.gif');

  const renderSpecField = (field: typeof PRODUCT_SPEC_FIELDS[number]) => {
    const value = String(newProduct[field.key] ?? '');

    if (field.type === 'select' && field.options) {
      return (
        <div className="admin-products-form-group" key={field.key}>
          <label className="admin-products-form-label">
            {field.label}{field.required ? ' *' : ''}
          </label>
          <select
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            className="admin-products-form-input"
            required={field.required}
          >
            <option value="">انتخاب کنید...</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="admin-products-form-group" key={field.key}>
        <label className="admin-products-form-label">
          {field.label}{field.required ? ' *' : ''}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => updateField(field.key, e.target.value)}
          className="admin-products-form-input"
          placeholder={field.placeholder}
          required={field.required}
        />
      </div>
    );
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1 className="admin-products-title">مدیریت محصولات</h1>
        <button type="button" className="admin-products-add-btn" onClick={resetForm}>
          افزودن محصول جدید
        </button>
      </div>

      <div className="admin-products-form-container">
        <form onSubmit={handleSubmit} className="admin-products-form">
          <h2 className="admin-products-form-title">
            {editId ? "ویرایش محصول" : "افزودن محصول جدید"}
          </h2>

          <div className="admin-products-form-grid">
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">مدل *</label>
              <select
                value={newProduct.model}
                onChange={(e) => {
                  const value = e.target.value;
                  const updatedImage = (!newProduct.image && value && value !== 'سایر...')
                    ? getDefaultImage(value)
                    : newProduct.image;
                  setNewProduct((prev) => ({ ...prev, model: value, image: updatedImage }));
                }}
                className="admin-products-form-input"
                required
              >
                <option value="">انتخاب کنید...</option>
                {MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {newProduct.model === 'سایر...' && (
                <input
                  type="text"
                  placeholder="نام مدل را وارد کنید"
                  value={customModel}
                  onChange={(e) => {
                    setCustomModel(e.target.value);
                    updateField("model", e.target.value);
                  }}
                  className="admin-products-form-input custom-input"
                  required
                />
              )}
            </div>

            <div className="admin-products-form-section-title admin-products-form-group-full">
              مشخصات فنی محصول
            </div>

            {PRODUCT_SPEC_FIELDS.map(renderSpecField)}

            <div className="admin-products-form-group">
              <label className="admin-products-form-label">قیمت (تومان) *</label>
              <input
                type="number"
                min="0"
                value={newProduct.price || ''}
                onChange={(e) => updateField("price", parseInt(e.target.value, 10) || 0)}
                className="admin-products-form-input"
                required
              />
            </div>

            <div className="admin-products-form-group admin-products-tags-group">
              <label className="admin-products-form-label">تگ‌ها</label>
              <div className="admin-products-tags">
                {TAGS.map((tag) => (
                  <label key={tag} className="admin-products-tag-label">
                    <input
                      type="checkbox"
                      checked={newProduct.tags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="admin-products-tag-checkbox"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-products-form-group admin-products-form-group-full">
              <label className="admin-products-form-label">توضیحات</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="admin-products-form-textarea"
                rows={4}
              />
            </div>

            <div className="admin-products-form-group admin-products-form-group-full">
              <label className="admin-products-form-label">تصویر محصول</label>
              <div className="admin-products-image-upload">
                <div className="admin-products-image-preview">
                  {uploadingImage ? (
                    <div className="admin-products-image-loading">
                      <img src="/loading.gif" alt="در حال آپلود..." />
                      <p>در حال آپلود...</p>
                    </div>
                  ) : (
                    <img src={previewImage} alt="پیش‌نمایش" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="admin-products-image-input"
                />
                <p className="admin-products-image-hint">
                  اگر تصویری آپلود نکنید، تصویر پیش‌فرض مدل استفاده می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-products-form-actions">
            <button type="submit" className="admin-products-form-submit" disabled={saving || loading}>
              {saving ? (
                <>
                  <img src="/loading.gif" alt="در حال ذخیره..." className="loading-icon" />
                  در حال ذخیره...
                </>
              ) : (
                editId ? "ذخیره تغییرات" : "ذخیره محصول"
              )}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="admin-products-form-cancel">
                لغو
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-products-table-container">
        <div className="admin-products-table-header">
          <h2>لیست محصولات ({products.length})</h2>
          <div className="admin-products-sort">
            <label>مرتب‌سازی:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="model">مدل</option>
              <option value="price">قیمت</option>
              <option value="tags">تگ</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="admin-products-sort-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className="admin-products-loading">
            <img src="/loading.gif" alt="در حال بارگذاری..." />
            <p>در حال بارگذاری...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="admin-products-empty">
            <p>هیچ محصولی وجود ندارد.</p>
          </div>
        ) : (
          <table className="admin-products-table">
            <thead>
              <tr>
                <th>تصویر</th>
                <th>مدل</th>
                <th>نوع کالا</th>
                <th>رنگ</th>
                <th>قیمت</th>
                <th>تگ‌ها</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const productImage = product.image
                  ? getImage(product.image)
                  : getDefaultImage(product.model);
                const goodsType = getProductGoodsType(product);

                return (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={productImage}
                        alt={`${product.model} ${goodsType}`}
                        className="admin-products-table-image"
                      />
                    </td>
                    <td>{product.model}</td>
                    <td>{goodsType}</td>
                    <td>{product.color}</td>
                    <td>{product.price.toLocaleString('fa-IR')} تومان</td>
                    <td>
                      <div className="admin-products-table-tags">
                        {product.tags.map((tag) => (
                          <span key={tag} className="admin-products-table-tag">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="admin-products-table-actions">
                        <button type="button" onClick={() => handleEdit(product)} className="admin-products-table-edit">
                          ویرایش
                        </button>
                        <button type="button" onClick={() => handleDelete(product.id)} className="admin-products-table-delete">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;

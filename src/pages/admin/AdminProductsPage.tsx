import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Product } from "../../types";
import { 
  MODELS, TYPES, COLORS, BODY_WEIGHTS, HOSE_MATERIALS, VALVE_MATERIALS, TAGS,
  getDefaultImage 
} from "../../constants";
import "./AdminProductsPage.css";

const AdminProductsPage: React.FC = () => {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getImage,
    showToast,
    loading,
  } = useAppContext();

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    model: "",
    type: "",
    color: "",
    bodyWeight: "",
    hoseMaterial: "",
    valveMaterial: "",
    tags: [],
    price: 0,
    description: "",
    image: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'model' | 'price' | 'tags'>('model');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [customModel, setCustomModel] = useState("");
  const [customType, setCustomType] = useState("");
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []); // فقط یک بار در mount اجرا شود

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const isDevelopment = import.meta.env.DEV;
      const apiUrl = isDevelopment
        ? "http://localhost:4020/upload-image"
        : `${window.location.origin}/api/upload-image`;

      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("خطا در آپلود تصویر");
      }

      const data = await res.json();
      setNewProduct({ ...newProduct, image: data.url || data.filename });
      showToast("تصویر با موفقیت آپلود شد ✅");
    } catch (err) {
      console.error("❌ Upload error:", err);
      showToast("خطا در آپلود تصویر ❌");
    } finally {
      setUploadingImage(false);
    }
  };

  // ذخیره (افزودن یا ویرایش)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // اعتبارسنجی اولیه
    if (!newProduct.model || !newProduct.type || !newProduct.color || !newProduct.bodyWeight || !newProduct.price) {
      showToast("لطفاً تمام فیلدهای الزامی را پر کنید ❌");
      return;
    }

    setSaving(true);
    try {
      // اگر تصویر آپلود نشده، از تصویر پیش‌فرض استفاده کن
      const productToSave = {
        ...newProduct,
        image: newProduct.image || (newProduct.model ? getDefaultImage(newProduct.model) : ''),
      };

      if (editId) {
        await updateProduct(editId, productToSave);
        showToast("محصول ویرایش شد ✅");
      } else {
        await addProduct(productToSave);
        showToast("محصول اضافه شد ✅");
      }
      
      // ریست فرم
      setNewProduct({
        model: "",
        type: "",
        color: "",
        bodyWeight: "",
        hoseMaterial: "",
        valveMaterial: "",
        tags: [],
        price: 0,
        description: "",
        image: "",
      });
      setEditId(null);
      setCustomModel("");
      setCustomType("");
      setCustomColor("");
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
    setNewProduct({ ...p });
    setEditId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // تغییر تگ‌ها
  const toggleTag = (tag: string) => {
    setNewProduct({
      ...newProduct,
      tags: newProduct.tags.includes(tag)
        ? newProduct.tags.filter(t => t !== tag)
        : [...newProduct.tags, tag],
    });
  };

  // مرتب‌سازی محصولات
  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'model') {
      comparison = a.model.localeCompare(b.model, 'fa');
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'tags') {
      comparison = a.tags.join('').localeCompare(b.tags.join(''), 'fa');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // نمایش تصویر پیش‌نمایش
  const previewImage = newProduct.image 
    ? getImage(newProduct.image) 
    : (newProduct.model ? getDefaultImage(newProduct.model) : '/loading.gif');

  return (
    <div className="admin-products">
      {/* هدر */}
      <div className="admin-products-header">
        <h1 className="admin-products-title">مدیریت محصولات</h1>
        <button
          className="admin-products-add-btn"
          onClick={() => {
            setEditId(null);
            setNewProduct({
              model: "",
              type: "",
              color: "",
              bodyWeight: "",
              hoseMaterial: "",
              valveMaterial: "",
              tags: [],
              price: 0,
              description: "",
              image: "",
            });
            setCustomModel("");
            setCustomType("");
            setCustomColor("");
          }}
        >
          افزودن محصول جدید
        </button>
      </div>

      {/* فرم */}
      <div className="admin-products-form-container">
        <form onSubmit={handleSubmit} className="admin-products-form">
          <h2 className="admin-products-form-title">
            {editId ? "ویرایش محصول" : "افزودن محصول جدید"}
          </h2>

          <div className="admin-products-form-grid">
            {/* مدل */}
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">مدل *</label>
              <select
                value={newProduct.model}
                onChange={(e) => {
                  const value = e.target.value;
                  // اگر تصویر آپلود نشده، از پیش‌فرض استفاده کن
                  const updatedImage = (!newProduct.image && value && value !== 'سایر...') 
                    ? getDefaultImage(value) 
                    : newProduct.image;
                  setNewProduct({ ...newProduct, model: value, image: updatedImage });
                }}
                className="admin-products-form-input"
                required
              >
                <option value="">انتخاب کنید...</option>
                {MODELS.map(model => (
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
                    setNewProduct({ ...newProduct, model: e.target.value });
                  }}
                  className="admin-products-form-input custom-input"
                  required
                />
              )}
            </div>

            {/* نوع */}
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">نوع *</label>
              <select
                value={newProduct.type}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewProduct({ 
                    ...newProduct, 
                    type: value,
                    // پاک کردن hoseMaterial و valveMaterial در صورت تغییر نوع
                    hoseMaterial: value === 'سینک' || value === 'روشویی' ? newProduct.hoseMaterial : '',
                    valveMaterial: value === 'آفتابه' || value === 'دوش حمام' ? newProduct.valveMaterial : '',
                  });
                }}
                className="admin-products-form-input"
                required
              >
                <option value="">انتخاب کنید...</option>
                {TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {newProduct.type === 'سایر...' && (
                <input
                  type="text"
                  placeholder="نام نوع را وارد کنید"
                  value={customType}
                  onChange={(e) => {
                    setCustomType(e.target.value);
                    setNewProduct({ ...newProduct, type: e.target.value });
                  }}
                  className="admin-products-form-input custom-input"
                  required
                />
              )}
            </div>

            {/* رنگ */}
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">رنگ *</label>
              <select
                value={newProduct.color}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewProduct({ ...newProduct, color: value });
                }}
                className="admin-products-form-input"
                required
              >
                <option value="">انتخاب کنید...</option>
                {COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              {newProduct.color === 'سایر...' && (
                <input
                  type="text"
                  placeholder="نام رنگ را وارد کنید"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setNewProduct({ ...newProduct, color: e.target.value });
                  }}
                  className="admin-products-form-input custom-input"
                  required
                />
              )}
            </div>

            {/* وزن تنه */}
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">وزن تنه *</label>
              <select
                value={newProduct.bodyWeight}
                onChange={(e) => setNewProduct({ ...newProduct, bodyWeight: e.target.value })}
                className="admin-products-form-input"
                required
              >
                <option value="">انتخاب کنید...</option>
                {BODY_WEIGHTS.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>

            {/* جنس شیلنگ (فقط برای سینک و روشویی) */}
            {(newProduct.type === 'سینک' || newProduct.type === 'روشویی') && (
              <div className="admin-products-form-group">
                <label className="admin-products-form-label">جنس شیلنگ</label>
                <select
                  value={newProduct.hoseMaterial || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, hoseMaterial: e.target.value })}
                  className="admin-products-form-input"
                >
                  <option value="">انتخاب کنید...</option>
                  {HOSE_MATERIALS.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
            )}

            {/* جنس شیر (فقط برای آفتابه و دوش) */}
            {(newProduct.type === 'آفتابه' || newProduct.type === 'دوش حمام') && (
              <div className="admin-products-form-group">
                <label className="admin-products-form-label">جنس شیر</label>
                <select
                  value={newProduct.valveMaterial || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, valveMaterial: e.target.value })}
                  className="admin-products-form-input"
                >
                  <option value="">انتخاب کنید...</option>
                  {VALVE_MATERIALS.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
            )}

            {/* قیمت */}
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">قیمت (تومان) *</label>
              <input
                type="number"
                min="0"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                className="admin-products-form-input"
                required
              />
            </div>

            {/* تگ‌ها */}
            <div className="admin-products-form-group admin-products-tags-group">
              <label className="admin-products-form-label">تگ‌ها</label>
              <div className="admin-products-tags">
                {TAGS.map(tag => (
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

            {/* توضیحات */}
            <div className="admin-products-form-group admin-products-form-group-full">
              <label className="admin-products-form-label">توضیحات</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="admin-products-form-textarea"
                rows={4}
              />
            </div>

            {/* آپلود تصویر */}
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

          {/* دکمه‌های فرم */}
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
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setNewProduct({
                    model: "",
                    type: "",
                    color: "",
                    bodyWeight: "",
                    hoseMaterial: "",
                    valveMaterial: "",
                    tags: [],
                    price: 0,
                    description: "",
                    image: "",
                  });
                }}
                className="admin-products-form-cancel"
              >
                لغو
              </button>
            )}
          </div>
        </form>
      </div>

      {/* جدول محصولات */}
      <div className="admin-products-table-container">
        <div className="admin-products-table-header">
          <h2>لیست محصولات ({products.length})</h2>
          <div className="admin-products-sort">
            <label>مرتب‌سازی:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="model">مدل</option>
              <option value="price">قیمت</option>
              <option value="tags">تگ</option>
            </select>
            <button
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
                <th>نوع</th>
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
                
                return (
                  <tr key={product.id}>
                    <td>
                      <img src={productImage} alt={`${product.model} ${product.type}`} className="admin-products-table-image" />
                    </td>
                    <td>{product.model}</td>
                    <td>{product.type}</td>
                    <td>{product.color}</td>
                    <td>{product.price.toLocaleString('fa-IR')} تومان</td>
                    <td>
                      <div className="admin-products-table-tags">
                        {product.tags.map(tag => (
                          <span key={tag} className="admin-products-table-tag">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="admin-products-table-actions">
                        <button
                          onClick={() => handleEdit(product)}
                          className="admin-products-table-edit"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="admin-products-table-delete"
                        >
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

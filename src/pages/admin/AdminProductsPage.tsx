import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Product } from "../../types";
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
  } = useAppContext();

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    price: 0,
    description: "",
    specs: { جنس: "", پوشش: "", گارانتی: "", تنه: "" },
    images: {
      کروم: "",
      سفید: "",
      مشکی: "",
      "سفید–طلایی": "",
      "مشکی–طلایی": "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState<{ [color: string]: boolean }>({});

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // آپلود تصویر به Cloudinary
  const handleImageUpload = async (file: File, color: string) => {
    setUploadingImages((prev) => ({ ...prev, [color]: true }));
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:4020/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setNewProduct({
        ...newProduct,
        images: { ...newProduct.images, [color]: data.url },
      });
      showToast(`تصویر ${color} با موفقیت آپلود شد ✅`);
    } catch (err) {
      console.error("❌ Image upload error:", err);
      showToast("خطا در آپلود تصویر ❌");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [color]: false }));
    }
  };

  // ذخیره (افزودن یا ویرایش)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateProduct(editId, newProduct);
        showToast("محصول ویرایش شد ✅");
      } else {
        await addProduct(newProduct);
        showToast("محصول اضافه شد ✅");
      }
      setNewProduct({
        name: "",
        category: "",
        price: 0,
        description: "",
        specs: { جنس: "", پوشش: "", گارانتی: "", تنه: "" },
        images: {
          کروم: "",
          سفید: "",
          مشکی: "",
          "سفید–طلایی": "",
          "مشکی–طلایی": "",
        },
      });
      setEditId(null);
    } catch {
      showToast("خطا در ذخیره محصول ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("آیا از حذف محصول مطمئن هستید؟")) {
      setLoading(true);
      await deleteProduct(id);
      setLoading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setNewProduct({ ...p });
    setEditId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              name: "",
              category: "",
              price: 0,
              description: "",
              specs: { جنس: "", پوشش: "", گارانتی: "", تنه: "" },
              images: {
                کروم: "",
                سفید: "",
                مشکی: "",
                "سفید–طلایی": "",
                "مشکی–طلایی": "",
              },
            });
          }}
        >
          افزودن محصول جدید
        </button>
      </div>

      {/* فرم */}
      <div className="admin-products-modal-content">
        <form onSubmit={handleSubmit} className="admin-products-modal-body">
          <div className="admin-products-form-grid">
            <div className="admin-products-form-group">
              <label className="admin-products-form-label">نام محصول</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="admin-products-form-input"
                required
              />
            </div>

            <div className="admin-products-form-group">
              <label className="admin-products-form-label">دسته‌بندی</label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="admin-products-form-input"
                required
              />
            </div>

            <div className="admin-products-form-group">
              <label className="admin-products-form-label">تنه</label>
              <input
                type="text"
                value={newProduct.specs.تنه}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    specs: { ...newProduct.specs, تنه: e.target.value },
                  })
                }
                className="admin-products-form-input"
              />
            </div>

            <div className="admin-products-form-group">
              <label className="admin-products-form-label">قیمت (تومان)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
                className="admin-products-form-input"
                required
              />
            </div>
          </div>

          <div className="admin-products-form-group">
            <label className="admin-products-form-label">توضیحات</label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="admin-products-form-textarea"
            />
          </div>

          {/* آپلود تصاویر برای رنگ‌های مختلف */}
          <div className="admin-products-form-group">
            <label className="admin-products-form-label">تصاویر محصول</label>
            <div className="admin-products-images-grid">
              {Object.keys(newProduct.images).map((color) => (
                <div key={color} className="admin-products-image-upload">
                  <label className="admin-products-image-label">
                    {color}
                    {uploadingImages[color] && (
                      <span className="admin-products-uploading">در حال آپلود...</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, color);
                      }
                    }}
                    className="admin-products-file-input"
                    disabled={uploadingImages[color]}
                  />
                  {newProduct.images[color] && (
                    <div className="admin-products-image-preview-wrapper">
                      <img
                        src={newProduct.images[color].startsWith("http") 
                          ? newProduct.images[color] 
                          : getImage(newProduct.images[color])}
                        alt={color}
                        className="admin-products-image-preview-small"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            images: { ...newProduct.images, [color]: "" },
                          });
                        }}
                        className="admin-products-remove-image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-products-modal-footer">
            <button
              type="submit"
              className="admin-products-add-btn"
              disabled={loading}
            >
              {loading
                ? "در حال ذخیره..."
                : editId
                ? "ویرایش محصول"
                : "افزودن محصول"}
            </button>
          </div>
        </form>
      </div>

      {/* جدول */}
      <div className="admin-products-table-container">
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>نام</th>
              <th>دسته‌بندی</th>
              <th>قیمت</th>
              <th>تنه</th>
              <th>تصویر</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.price.toLocaleString()} تومان</td>
                  <td>{p.specs.تنه || "—"}</td>
                  <td>
                    {p.images?.کروم ? (
                      <img
                        src={getImage(p.images.کروم)}
                        alt={p.name}
                        className="admin-products-image-preview"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="admin-products-actions">
                      <button
                        className="admin-products-edit-btn admin-products-action-btn"
                        onClick={() => handleEdit(p)}
                      >
                        ویرایش
                      </button>
                      <button
                        className="admin-products-delete-btn admin-products-action-btn"
                        onClick={() => handleDelete(p.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  محصولی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;

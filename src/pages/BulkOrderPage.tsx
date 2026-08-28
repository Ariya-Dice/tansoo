import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  fetchBulkOrderDepositAmount,
  formatTomans,
  submitBulkOrderRequest,
} from '../services/bulkOrder';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import './BulkOrderPage.css';

const CARTON_SIZE = 12;

interface SelectedProduct {
  productId: number;
  model: string;
  goodsType: string;
  color: string;
  cartons: number;
}

const BulkOrderPage: React.FC = () => {
  const { products, showToast } = useAppContext();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [cartons, setCartons] = useState(1);

  const [selectedProducts, setSelectedProducts] = useState<
    SelectedProduct[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [depositLoading, setDepositLoading] = useState(true);
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  const selectedProduct = products.find(
    (product) => String(product.id) === selectedProductId,
  );

  const addProduct = () => {
    if (!selectedProduct) {
      showToast('لطفاً محصول را انتخاب کنید.');
      return;
    }

    if (!Number.isInteger(cartons) || cartons < 1) {
      showToast('تعداد کارتن باید حداقل ۱ باشد.');
      return;
    }

    setSelectedProducts((current) => {
      const existing = current.find(
        (item) => item.productId === selectedProduct.id,
      );

      if (existing) {
        return current.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                cartons: item.cartons + cartons,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: selectedProduct.id,
          model: selectedProduct.model,
          goodsType: selectedProduct.goodsType,
          color: selectedProduct.color,
          cartons,
        },
      ];
    });

    setSelectedProductId('');
    setCartons(1);

    showToast('محصول به سفارش اضافه شد.');
  };

  const increaseCartons = (productId: number) => {
    setSelectedProducts((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              cartons: item.cartons + 1,
            }
          : item,
      ),
    );
  };

  const decreaseCartons = (productId: number) => {
    setSelectedProducts((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                cartons: item.cartons - 1,
              }
            : item,
        )
        .filter((item) => item.cartons > 0),
    );
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const totalCartons = selectedProducts.reduce(
    (sum, item) => sum + item.cartons,
    0,
  );

  const totalPieces = totalCartons * CARTON_SIZE;

  useEffect(() => {
    let cancelled = false;

    async function loadDeposit() {
      if (!isSupabaseConfigured()) {
        setDepositLoading(false);
        return;
      }

      try {
        const amount = await fetchBulkOrderDepositAmount();
        if (!cancelled) {
          setDepositAmount(amount);
        }
      } catch {
        if (!cancelled) {
          setDepositAmount(null);
        }
      } finally {
        if (!cancelled) {
          setDepositLoading(false);
        }
      }
    }

    loadDeposit();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      showToast('لطفاً نام و شماره تماس را وارد کنید.');
      return;
    }

    if (selectedProducts.length === 0) {
      showToast('حداقل یک محصول به سفارش اضافه کنید.');
      return;
    }

    if (!isSupabaseConfigured()) {
      showToast('سیستم ثبت درخواست پیکربندی نشده است.');
      return;
    }

    setSubmitting(true);

    try {
      const firstProduct = selectedProducts[0];

      const productsText = selectedProducts
        .map((item, index) => {
          const pieces = item.cartons * CARTON_SIZE;

          return [
            `${index + 1}. ${item.model}`,
            `نوع کالا: ${item.goodsType}`,
            item.color ? `رنگ: ${item.color}` : '',
            `تعداد: ${item.cartons} کارتن`,
            `تعداد کل: ${pieces} عدد`,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');

      const orderNote = [
        'جزئیات سفارش عمده:',
        '',
        productsText,
        '',
        `مجموع: ${totalCartons} کارتن`,
        `مجموع تعداد: ${totalPieces} عدد`,
        '',
        note.trim() ? `توضیحات مشتری:\n${note.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const result = await submitBulkOrderRequest({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),

        /*
         * برای سازگاری با ساختار فعلی Edge Function،
         * محصول اول به عنوان goodsType ارسال می‌شود
         * و جزئیات کامل همه محصولات داخل note قرار می‌گیرد.
         */
        goodsType:
          selectedProducts.length === 1
            ? firstProduct.goodsType
            : 'سفارش چند محصولی',

        quantity: `${totalCartons} کارتن (${totalPieces} عدد)`,

        note: orderNote,
        idempotencyKey: idempotencyKeyRef.current,
      });

      if (!result.paymentUrl) {
        throw new Error('آدرس درگاه پرداخت دریافت نشد.');
      }

      window.location.assign(result.paymentUrl);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'خطا در ثبت سفارش',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bulk-order-page">
      <div className="container bulk-order-layout">

        <header className="bulk-order-header">
          <h1>خرید عمده / تعداد بالا</h1>

          <p>
            برای سفارش‌های با تعداد بالا، محصولات مورد
            نظر خود را انتخاب کنید. سفارش عمده فقط به
            صورت کارتن ۱۲ عددی ثبت می‌شود.
          </p>

          <p>
            لطفا توجه داشته باشید که سیستم فروش آربی،
            سفارش محور میباشد. آماده سازی و ارسال سفارش
            با توجه به تعداد سفارش، حدود 3 تا 10 روز
            کاری زمان خواهد برد.
          </p>
        </header>

        <div className="bulk-order-card">

          <form
            onSubmit={handleSubmit}
            className="bulk-order-form"
          >

            {/* اطلاعات مشتری */}

            <div className="bulk-order-row">

              <div className="bulk-order-field">
                <label htmlFor="name">
                  نام و نام خانوادگی *
                </label>

                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="bulk-order-field">
                <label htmlFor="phone">
                  شماره تماس *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="bulk-order-field">
              <label htmlFor="company">
                نام شرکت / فروشگاه (اختیاری)
              </label>

              <input
                id="company"
                name="company"
                value={company}
                onChange={(e) =>
                  setCompany(e.target.value)
                }
              />
            </div>

            {/* انتخاب محصول */}

            <section className="bulk-products-section">

              <h3>
                انتخاب محصولات
              </h3>

              <div className="bulk-product-row">

                <div className="bulk-order-field">
                  <label htmlFor="product">
                    محصول *
                  </label>

                  <select
                    id="product"
                    value={selectedProductId}
                    onChange={(e) =>
                      setSelectedProductId(
                        e.target.value,
                      )
                    }
                  >
                    <option value="">
                      انتخاب محصول...
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.model}
                        {product.color
                          ? ` - ${product.color}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bulk-order-field">
                  <label htmlFor="cartons">
                    تعداد کارتن
                  </label>

                  <input
                    id="cartons"
                    type="number"
                    min="1"
                    step="1"
                    value={cartons}
                    onChange={(e) => {
                      const value = Number(
                        e.target.value,
                      );

                      setCartons(
                        Number.isInteger(value) &&
                          value >= 1
                          ? value
                          : 1,
                      );
                    }}
                  />
                </div>

                <div className="bulk-carton-preview">
                  <strong>
                    {cartons} کارتن
                  </strong>

                  <small>
                    {cartons * CARTON_SIZE} عدد
                  </small>
                </div>

              </div>

              <div className="bulk-carton-info">
                <strong>
                  هر کارتن = ۱۲ عدد
                </strong>

                {selectedProduct && (
                  <span>
                    {selectedProduct.model} —{' '}
                    {cartons} کارتن × ۱۲ عدد ={' '}
                    {cartons * CARTON_SIZE} عدد
                  </span>
                )}
              </div>

              <button
                type="button"
                className="add-product-btn"
                onClick={addProduct}
              >
                + افزودن محصول به سفارش
              </button>

            </section>

            {/* محصولات انتخاب شده */}

            {selectedProducts.length > 0 && (
              <section className="bulk-products-section">

                <h3>
                  محصولات سفارش شما
                </h3>

                <div className="bulk-selected-products">

                  {selectedProducts.map((item) => {
                    const pieces =
                      item.cartons * CARTON_SIZE;

                    return (
                      <div
                        key={item.productId}
                        className="bulk-selected-product"
                      >

                        <div className="bulk-selected-product-info">

                          <strong>
                            {item.model}
                          </strong>

                          <span>
                            {item.goodsType}
                            {item.color
                              ? ` — ${item.color}`
                              : ''}
                          </span>

                          <small>
                            {item.cartons} کارتن × ۱۲
                            عدد = {pieces} عدد
                          </small>

                        </div>

                        <div className="bulk-product-controls">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseCartons(
                                item.productId,
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.cartons}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseCartons(
                                item.productId,
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                        <button
                          type="button"
                          className="remove-product-btn"
                          onClick={() =>
                            removeProduct(
                              item.productId,
                            )
                          }
                        >
                          حذف
                        </button>

                      </div>
                    );
                  })}

                </div>

                <div className="bulk-order-total">

                  <span>
                    مجموع کارتن:{' '}
                    <strong>
                      {totalCartons}
                    </strong>
                  </span>

                  <span>
                    مجموع تعداد:{' '}
                    <strong>
                      {totalPieces} عدد
                    </strong>
                  </span>

                </div>

              </section>
            )}

            {/* توضیحات */}

            <div className="bulk-order-field">

              <label htmlFor="note">
                توضیحات
              </label>

              <textarea
                id="note"
                name="note"
                rows={4}
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="مدل، رنگ، زمان تحویل و ..."
              />

            </div>

            {/* سپرده ثبت‌نام */}

            <div className="bulk-order-deposit-notice">
              <h3>سپرده ثبت درخواست</h3>
              {depositLoading ? (
                <p>در حال دریافت مبلغ سپرده...</p>
              ) : depositAmount != null ? (
                <>
                  <p>
                    برای ثبت درخواست خرید عمده، پرداخت سپرده به مبلغ{' '}
                    <strong>{formatTomans(depositAmount)}</strong> الزامی است.
                  </p>
                  <p>
                    این مبلغ هزینه اضافه نیست؛ سپرده ثبت‌نام پس از نهایی شدن
                    سفارش عمده، از مبلغ فاکتور نهایی کسر خواهد شد.
                  </p>
                </>
              ) : (
                <p>
                  مبلغ سپرده در حال حاضر قابل نمایش نیست. در صورت تکمیل فرم،
                  مبلغ از سمت سرور تعیین می‌شود.
                </p>
              )}
            </div>

            {/* ثبت */}

            <button
              type="submit"
              className="bulk-order-submit"
              disabled={
                submitting ||
                selectedProducts.length === 0
              }
            >
              {submitting
                ? 'در حال انتقال به درگاه پرداخت...'
                : depositAmount != null
                  ? `پرداخت سپرده و ثبت درخواست (${formatTomans(depositAmount)})`
                  : 'پرداخت سپرده و ثبت درخواست'}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage;
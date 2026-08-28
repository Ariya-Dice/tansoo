import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAppContext } from '../context/AppContext';

import {
  fetchBulkOrderDepositAmount,
  formatTomans,
  submitBulkOrderRequest,
} from '../services/bulkOrder';

import { isSupabaseConfigured } from '../lib/supabaseClient';

import './BulkOrderPage.css';

interface SelectedProduct {
  productId: number;
  model: string;
  goodsType: string;
  color: string;
  cartons: number;
}

/*
 * ترتیب نمایش نوع کالا
 */
const PRODUCT_TYPES = [
  'ظرفشویی',
  'روشویی',
  'حمام',
  'توالت',
];

/*
 * تعداد محصول داخل هر کارتن
 *
 * بامبو = ۸ عدد
 * سایر محصولات = ۱۲ عدد
 */
const getCartonSize = (model: string): number => {
  return model.trim().includes('بامبو') ? 8 : 12;
};

/*
 * ساخت عنوان محصول
 */
const getProductLabel = (
  model: string,
  goodsType: string,
  color?: string,
): string => {
  const parts: string[] = [
    model,
    goodsType,
  ];

  if (color) {
    parts.push(color);
  }

  return parts.join(' - ');
};

/*
 * نرمال‌سازی حروف فارسی
 */
const normalizeText = (
  value: string,
): string => {
  return value
    .trim()
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک');
};

const BulkOrderPage: React.FC = () => {
  const {
    products,
    showToast,
  } = useAppContext();

  /*
   * اطلاعات مشتری
   */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');

  /*
   * محصول در حال انتخاب
   */
  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState('');

  const [cartons, setCartons] = useState(1);

  /*
   * محصولات انتخاب‌شده
   */
  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState<SelectedProduct[]>([]);

  /*
   * وضعیت ثبت سفارش
   */
  const [submitting, setSubmitting] =
    useState(false);

  /*
   * مبلغ سپرده
   */
  const [depositAmount, setDepositAmount] =
    useState<number | null>(null);

  const [depositLoading, setDepositLoading] =
    useState(true);

  const [depositError, setDepositError] =
    useState<string | null>(null);

  /*
   * جلوگیری از ثبت دوباره سفارش
   */
  const idempotencyKeyRef =
    useRef<string>(
      crypto.randomUUID(),
    );

  /*
   * محصول انتخاب‌شده
   */
  const selectedProduct =
    products.find(
      (product) =>
        String(product.id) ===
        selectedProductId,
    );

  /*
   * گروه‌بندی محصولات بر اساس مدل
   */
  const groupedProducts =
    products.reduce<
      Record<string, typeof products>
    >(
      (groups, product) => {
        const model =
          product.model?.trim() ||
          'سایر';

        if (!groups[model]) {
          groups[model] = [];
        }

        groups[model].push(product);

        return groups;
      },
      {},
    );

  /*
   * مرتب‌سازی محصولات
   *
   * ترتیب:
   * ظرفشویی
   * روشویی
   * حمام
   * توالت
   */
  const sortedProductGroups =
    Object.entries(groupedProducts)
      .map(
        ([model, modelProducts]) => {
          const sortedProducts = [
            ...modelProducts,
          ].sort((a, b) => {
            const aType =
              normalizeText(
                a.goodsType || '',
              );

            const bType =
              normalizeText(
                b.goodsType || '',
              );

            const aIndex =
              PRODUCT_TYPES.findIndex(
                (type) =>
                  normalizeText(type) ===
                  aType,
              );

            const bIndex =
              PRODUCT_TYPES.findIndex(
                (type) =>
                  normalizeText(type) ===
                  bType,
              );

            const safeAIndex =
              aIndex === -1
                ? 999
                : aIndex;

            const safeBIndex =
              bIndex === -1
                ? 999
                : bIndex;

            if (
              safeAIndex !==
              safeBIndex
            ) {
              return (
                safeAIndex -
                safeBIndex
              );
            }

            return aType.localeCompare(
              bType,
              'fa',
            );
          });

          return {
            model,
            products:
              sortedProducts,
          };
        },
      )
      .sort((a, b) =>
        a.model.localeCompare(
          b.model,
          'fa',
        ),
      );

  /*
   * افزودن محصول به سفارش
   */
  const addProduct = () => {
    if (!selectedProduct) {
      showToast(
        'لطفاً محصول را انتخاب کنید.',
      );
      return;
    }

    if (
      !Number.isInteger(cartons) ||
      cartons < 1
    ) {
      showToast(
        'تعداد کارتن باید حداقل ۱ باشد.',
      );
      return;
    }

    setSelectedProducts(
      (current) => {
        const existing =
          current.find(
            (item) =>
              item.productId ===
              selectedProduct.id,
          );

        /*
         * اگر محصول قبلاً انتخاب شده،
         * تعداد کارتن به آن اضافه می‌شود.
         */
        if (existing) {
          return current.map(
            (item) => {
              if (
                item.productId !==
                selectedProduct.id
              ) {
                return item;
              }

              return {
                ...item,
                cartons:
                  item.cartons +
                  cartons,
              };
            },
          );
        }

        /*
         * محصول جدید
         */
        return [
          ...current,
          {
            productId:
              selectedProduct.id,

            model:
              selectedProduct.model,

            goodsType:
              selectedProduct.goodsType,

            color:
              selectedProduct.color,

            cartons,
          },
        ];
      },
    );

    setSelectedProductId('');
    setCartons(1);

    showToast(
      'محصول به سفارش اضافه شد.',
    );
  };

  /*
   * افزایش تعداد کارتن
   */
  const increaseCartons = (
    productId: number,
  ) => {
    setSelectedProducts(
      (current) =>
        current.map((item) => {
          if (
            item.productId !==
            productId
          ) {
            return item;
          }

          return {
            ...item,
            cartons:
              item.cartons + 1,
          };
        }),
    );
  };

  /*
   * کاهش تعداد کارتن
   */
  const decreaseCartons = (
    productId: number,
  ) => {
    setSelectedProducts(
      (current) =>
        current
          .map((item) => {
            if (
              item.productId !==
              productId
            ) {
              return item;
            }

            return {
              ...item,
              cartons:
                item.cartons - 1,
            };
          })
          .filter(
            (item) =>
              item.cartons > 0,
          ),
    );
  };

  /*
   * حذف محصول
   */
  const removeProduct = (
    productId: number,
  ) => {
    setSelectedProducts(
      (current) =>
        current.filter(
          (item) =>
            item.productId !==
            productId,
        ),
    );
  };

  /*
   * مجموع کارتن‌ها
   */
  const totalCartons =
    selectedProducts.reduce(
      (sum, item) =>
        sum + item.cartons,
      0,
    );

  /*
   * مجموع تعداد قطعات
   */
  const totalPieces =
    selectedProducts.reduce(
      (sum, item) => {
        const cartonSize =
          getCartonSize(
            item.model,
          );

        return (
          sum +
          item.cartons *
            cartonSize
        );
      },
      0,
    );

  /*
   * دریافت مبلغ سپرده
   */
  useEffect(() => {
    let cancelled = false;

    const loadDeposit =
      async () => {
        /*
         * بررسی تنظیم بودن Supabase
         */
        if (
          !isSupabaseConfigured()
        ) {
          if (!cancelled) {
            setDepositLoading(
              false,
            );

            setDepositError(
              'سیستم پرداخت پیکربندی نشده است.',
            );
          }

          return;
        }

        try {
          const amount =
            await fetchBulkOrderDepositAmount();

          if (cancelled) {
            return;
          }

          setDepositAmount(amount);
          setDepositError(null);
        } catch (error) {
          if (cancelled) {
            return;
          }

          setDepositAmount(null);

          setDepositError(
            error instanceof Error
              ? error.message
              : 'مبلغ سپرده از سرور دریافت نشد.',
          );
        } finally {
          if (!cancelled) {
            setDepositLoading(
              false,
            );
          }
        }
      };

    loadDeposit();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ثبت سفارش
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    /*
     * اعتبارسنجی نام
     */
    if (!name.trim()) {
      showToast(
        'لطفاً نام و نام خانوادگی را وارد کنید.',
      );
      return;
    }

    /*
     * اعتبارسنجی شماره تماس
     */
    if (!phone.trim()) {
      showToast(
        'لطفاً شماره تماس را وارد کنید.',
      );
      return;
    }

    /*
     * حداقل یک محصول
     */
    if (
      selectedProducts.length === 0
    ) {
      showToast(
        'حداقل یک محصول به سفارش اضافه کنید.',
      );
      return;
    }

    /*
     * بررسی Supabase
     */
    if (
      !isSupabaseConfigured()
    ) {
      showToast(
        'سیستم ثبت درخواست پیکربندی نشده است.',
      );
      return;
    }

    /*
     * بدون دریافت مبلغ سپرده
     * اجازه ثبت سفارش داده نمی‌شود.
     */
    if (depositAmount === null) {
      showToast(
        'مبلغ سپرده از سرور دریافت نشده است.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const firstProduct =
        selectedProducts[0];

      /*
       * ساخت جزئیات محصولات
       */
      const productDetails: string[] =
        [];

      selectedProducts.forEach(
        (item, index) => {
          const cartonSize =
            getCartonSize(
              item.model,
            );

          const pieces =
            item.cartons *
            cartonSize;

          const lines: string[] =
            [];

          lines.push(
            String(index + 1) +
              '. ' +
              item.model,
          );

          lines.push(
            'نوع کالا: ' +
              item.goodsType,
          );

          if (item.color) {
            lines.push(
              'رنگ: ' +
                item.color,
            );
          }

          lines.push(
            'تعداد: ' +
              String(
                item.cartons,
              ) +
              ' کارتن',
          );

          lines.push(
            'ظرفیت هر کارتن: ' +
              String(
                cartonSize,
              ) +
              ' عدد',
          );

          lines.push(
            'تعداد کل: ' +
              String(
                pieces,
              ) +
              ' عدد',
          );

          productDetails.push(
            lines.join('\n'),
          );
        },
      );

      /*
       * متن محصولات
       */
      const productsText =
        productDetails.join(
          '\n\n',
        );

      /*
       * ساخت متن نهایی سفارش
       */
      const orderLines: string[] =
        [
          'جزئیات سفارش عمده:',
          '',
          productsText,
          '',
          'مجموع: ' +
            String(
              totalCartons,
            ) +
            ' کارتن',

          'مجموع تعداد: ' +
            String(
              totalPieces,
            ) +
            ' عدد',
        ];

      /*
       * توضیحات مشتری
       */
      if (note.trim()) {
        orderLines.push('');
        orderLines.push(
          'توضیحات مشتری:',
        );
        orderLines.push(
          note.trim(),
        );
      }

      const orderNote =
        orderLines.join('\n');

      /*
       * ارسال سفارش به Edge Function
       */
      const result =
        await submitBulkOrderRequest(
          {
            name: name.trim(),

            phone: phone.trim(),

            company:
              company.trim(),

            goodsType:
              selectedProducts.length ===
              1
                ? firstProduct.goodsType
                : 'سفارش چند محصولی',

            quantity:
              String(
                totalCartons,
              ) +
              ' کارتن (' +
              String(
                totalPieces,
              ) +
              ' عدد)',

            note: orderNote,

            idempotencyKey:
              idempotencyKeyRef.current,
          },
        );

      /*
       * بررسی آدرس پرداخت
       */
      if (
        !result ||
        !result.paymentUrl
      ) {
        throw new Error(
          'آدرس درگاه پرداخت دریافت نشد.',
        );
      }

      /*
       * انتقال به درگاه
       */
      window.location.assign(
        result.paymentUrl,
      );
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

          <h1>
            خرید عمده / تعداد بالا
          </h1>

          <p>
            برای سفارش‌های با تعداد بالا،
            محصولات مورد نظر خود را انتخاب
            کنید. سفارش عمده بر اساس تعداد
            کارتن هر محصول ثبت می‌شود.
          </p>

          <p>
            ظرفیت کارتن محصولات متفاوت است؛
            محصولات بامبو در کارتن ۸ عددی و
            سایر محصولات در کارتن ۱۲ عددی
            عرضه می‌شوند.
          </p>

          <p>
            لطفا توجه داشته باشید که سیستم
            فروش آربی، سفارش محور میباشد.
            آماده سازی و ارسال سفارش با توجه
            به تعداد سفارش، حدود 3 تا 10 روز
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
                  type="text"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value,
                    )
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
                  inputMode="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value,
                    )
                  }
                />

              </div>

            </div>

            {/* شرکت / فروشگاه */}

            <div className="bulk-order-field">

              <label htmlFor="company">
                نام شرکت / فروشگاه
                (اختیاری)
              </label>

              <input
                id="company"
                name="company"
                type="text"
                value={company}
                onChange={(e) =>
                  setCompany(
                    e.target.value,
                  )
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
                    value={
                      selectedProductId
                    }
                    onChange={(e) =>
                      setSelectedProductId(
                        e.target.value,
                      )
                    }
                  >

                    <option value="">
                      انتخاب محصول...
                    </option>

                    {sortedProductGroups.map(
                      (group) => (
                        <optgroup
                          key={
                            group.model
                          }
                          label={
                            group.model
                          }
                        >

                          {group.products.map(
                            (product) => {
                              const cartonSize =
                                getCartonSize(
                                  product.model,
                                );

                              return (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {getProductLabel(
                                    product.model,
                                    product.goodsType,
                                    product.color,
                                  )}

                                  {' — کارتن '}

                                  {
                                    cartonSize
                                  }

                                  {' عددی'}
                                </option>
                              );
                            },
                          )}

                        </optgroup>
                      ),
                    )}

                  </select>

                </div>

                <div className="bulk-order-field">

                  <label htmlFor="cartons">
                    تعداد کارتن
                  </label>

                  <input
                    id="cartons"
                    name="cartons"
                    type="number"
                    min="1"
                    step="1"
                    value={cartons}
                    onChange={(e) => {
                      const value =
                        Number(
                          e.target.value,
                        );

                      if (
                        Number.isInteger(
                          value,
                        ) &&
                        value >= 1
                      ) {
                        setCartons(
                          value,
                        );
                      } else {
                        setCartons(1);
                      }
                    }}
                  />

                </div>

                <div className="bulk-carton-preview">

                  <strong>
                    {cartons} کارتن
                  </strong>

                  <small>
                    {selectedProduct
                      ? cartons *
                        getCartonSize(
                          selectedProduct.model,
                        )
                      : 0}{' '}
                    عدد
                  </small>

                </div>

              </div>

              <div className="bulk-carton-info">

                {selectedProduct ? (
                  <>
                    <strong>
                      هر کارتن ={' '}
                      {getCartonSize(
                        selectedProduct.model,
                      )}{' '}
                      عدد
                    </strong>

                    <span>
                      {
                        selectedProduct.model
                      }

                      {' — '}

                      {
                        selectedProduct.goodsType
                      }

                      {selectedProduct.color
                        ? ' — ' +
                          selectedProduct.color
                        : ''}

                      {' — '}

                      {cartons}

                      {' کارتن × '}

                      {getCartonSize(
                        selectedProduct.model,
                      )}

                      {' عدد = '}

                      {cartons *
                        getCartonSize(
                          selectedProduct.model,
                        )}

                      {' عدد'}
                    </span>
                  </>
                ) : (
                  <strong>
                    لطفاً محصول مورد نظر را
                    انتخاب کنید.
                  </strong>
                )}

              </div>

              <button
                type="button"
                className="add-product-btn"
                onClick={
                  addProduct
                }
              >
                + افزودن محصول به سفارش
              </button>

            </section>

            {/* محصولات انتخاب‌شده */}

            {selectedProducts.length >
              0 && (
              <section className="bulk-products-section">

                <h3>
                  محصولات سفارش شما
                </h3>

                <div className="bulk-selected-products">

                  {selectedProducts.map(
                    (item) => {
                      const cartonSize =
                        getCartonSize(
                          item.model,
                        );

                      const pieces =
                        item.cartons *
                        cartonSize;

                      return (
                        <div
                          key={
                            item.productId
                          }
                          className="bulk-selected-product"
                        >

                          <div className="bulk-selected-product-info">

                            <strong>
                              {
                                item.model
                              }
                            </strong>

                            <span>
                              {
                                item.goodsType
                              }

                              {item.color
                                ? ' — ' +
                                  item.color
                                : ''}
                            </span>

                            <small>
                              {
                                item.cartons
                              }

                              {' کارتن × '}

                              {
                                cartonSize
                              }

                              {' عدد = '}

                              {pieces}

                              {' عدد'}
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
                              aria-label="کاهش تعداد کارتن"
                            >
                              −
                            </button>

                            <span>
                              {
                                item.cartons
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseCartons(
                                  item.productId,
                                )
                              }
                              aria-label="افزایش تعداد کارتن"
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
                    },
                  )}

                </div>

                <div className="bulk-order-total">

                  <span>
                    مجموع کارتن:{' '}
                    <strong>
                      {
                        totalCartons
                      }
                    </strong>
                  </span>

                  <span>
                    مجموع تعداد:{' '}
                    <strong>
                      {
                        totalPieces
                      }{' '}
                      عدد
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
                  setNote(
                    e.target.value,
                  )
                }
                placeholder="مدل، رنگ، زمان تحویل و ..."
              />

            </div>

            {/* سپرده */}

            <div className="bulk-order-deposit-notice">

              <h3>
                سپرده ثبت درخواست
              </h3>

              {depositLoading ? (
                <p>
                  در حال دریافت مبلغ سپرده...
                </p>
              ) : depositAmount !==
                null ? (
                <>
                  <p>
                    برای ثبت درخواست خرید
                    عمده، پرداخت سپرده به
                    مبلغ{' '}

                    <strong>
                      {formatTomans(
                        depositAmount,
                      )}
                    </strong>

                    {' '}الزامی است.
                  </p>

                  <p>
                    این مبلغ هزینه اضافه
                    نیست؛ سپرده ثبت‌نام پس
                    از نهایی شدن سفارش عمده،
                    از مبلغ فاکتور نهایی
                    کسر خواهد شد.
                  </p>
                </>
              ) : (
                <p className="bulk-order-deposit-error">
                  {depositError ||
                    'مبلغ سپرده در حال حاضر قابل نمایش نیست.'}
                </p>
              )}

            </div>

            {/* ثبت سفارش */}

            <button
              type="submit"
              className="bulk-order-submit"
              disabled={
                submitting ||
                selectedProducts.length ===
                  0 ||
                depositAmount === null
              }
            >
              {submitting
                ? 'در حال انتقال به درگاه پرداخت...'
                : depositAmount !== null
                  ? 'پرداخت سپرده و ثبت درخواست (' +
                    formatTomans(
                      depositAmount,
                    ) +
                    ')'
                  : 'ثبت درخواست و پرداخت سپرده'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default BulkOrderPage;
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ProductCard from '../components/ProductCard';
import ReplacementProgramBanner from '../components/ReplacementProgramBanner';
import { useAppContext } from '../context/AppContext';
import {
  MODELS,
  TYPES,
  COLORS,
  TAGS,
} from '../constants';
import { getProductGoodsType } from '../productSpecs';
import { getApiErrorHint } from '../utils/apiError';
import { Search, X } from 'lucide-react';
import './ProductsPage.css';

/* ==========================================
   BACKGROUND COLORS
========================================== */

const BACKGROUND_COLORS = [
  '#0F172A',
  '#172554',
  '#1E3A5F',
  '#164E63',
  '#134E4A',
  '#1E293B',
  '#1F2937',
  '#27272A',
  '#312E81',
  '#1E1B4B',
  '#172554',
  '#0C4A6E',
  '#164E63',
  '#334155',
  '#374151',
  '#27272A',
  '#3F3F46',
  '#1F2937',
  '#111827',
  '#0F172A',
];

const FADE_DURATION = 900;

const ProductsPage: React.FC = () => {
  const {
    products,
    loading,
    error,
  } = useAppContext();

  /* ==========================================
     FILTERS
  ========================================== */

  const [selectedModel, setSelectedModel] =
    useState<string>('همه');

  const [selectedType, setSelectedType] =
    useState<string>('همه');

  const [selectedColor, setSelectedColor] =
    useState<string>('همه');

  const [selectedTag, setSelectedTag] =
    useState<string>('همه');

  const [sortBy, setSortBy] = useState<
    'price-asc' | 'price-desc' | 'none'
  >('none');

  const [customModel, setCustomModel] =
    useState<string>('');

  /* ==========================================
     MOBILE FILTERS
  ========================================== */

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState<boolean>(false);

  /* ==========================================
     BACKGROUND STATE
  ========================================== */

  /*
   * Current background color.
   */
  const [currentBackgroundIndex, setCurrentBackgroundIndex] =
    useState<number>(0);

  /*
   * Previous background color remains visible
   * underneath while the new color fades in.
   */
  const [previousBackgroundIndex, setPreviousBackgroundIndex] =
    useState<number | null>(null);

  /*
   * Used as a React key to restart the Fade
   * animation on every color change.
   */
  const [backgroundTransitionKey, setBackgroundTransitionKey] =
    useState<number>(0);

  /*
   * Global color cursor.
   *
   * This always moves forward, regardless
   * of whether the user scrolls up or down.
   */
  const backgroundCursorRef =
    useRef<number>(0);

  /*
   * Current scroll zone:
   *
   * 0 = first third
   * 1 = second third
   * 2 = final third
   */
  const previousScrollZoneRef =
    useRef<number>(0);

  const scrollTickingRef =
    useRef<boolean>(false);

  const fadeTimeoutRef =
    useRef<number | null>(null);

  /* ==========================================
     BACKGROUND SCROLL LOGIC
  ========================================== */

  useEffect(() => {
    const getScrollZone = (): number => {
      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight -
        viewportHeight;

      if (
        scrollableHeight <= 0
      ) {
        return 0;
      }

      const progress =
        scrollTop /
        scrollableHeight;

      if (
        progress < 1 / 3
      ) {
        return 0;
      }

      if (
        progress < 2 / 3
      ) {
        return 1;
      }

      return 2;
    };

    const changeBackground = (
      crossedBoundaries: number
    ): void => {
      if (
        crossedBoundaries <= 0
      ) {
        return;
      }

      const currentIndex =
        backgroundCursorRef.current;

      const maximumIndex =
        BACKGROUND_COLORS.length - 1;

      /*
       * Consume one new color for every
       * crossed boundary.
       */
      const nextIndex = Math.min(
        currentIndex +
          crossedBoundaries,
        maximumIndex
      );

      /*
       * Stop once all colors have been used.
       */
      if (
        nextIndex ===
        currentIndex
      ) {
        return;
      }

      /*
       * Keep the old color underneath.
       */
      setPreviousBackgroundIndex(
        currentIndex
      );

      /*
       * Advance the color cursor.
       */
      backgroundCursorRef.current =
        nextIndex;

      /*
       * Set the new color.
       */
      setCurrentBackgroundIndex(
        nextIndex
      );

      /*
       * Restart the Fade animation.
       */
      setBackgroundTransitionKey(
        (value) => value + 1
      );

      /*
       * Remove the old layer only after
       * the new color has completely faded in.
       */
      if (
        fadeTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          fadeTimeoutRef.current
        );
      }

      fadeTimeoutRef.current =
        window.setTimeout(() => {
          setPreviousBackgroundIndex(
            null
          );

          fadeTimeoutRef.current =
            null;
        }, FADE_DURATION);
    };

    const updateBackground = (): void => {
      const currentZone =
        getScrollZone();

      const previousZone =
        previousScrollZoneRef.current;

      if (
        currentZone ===
        previousZone
      ) {
        return;
      }

      /*
       * Save the new zone.
       */
      previousScrollZoneRef.current =
        currentZone;

      /*
       * Direction is ignored.
       *
       * Every crossed boundary consumes
       * a new color.
       */
      const crossedBoundaries =
        Math.abs(
          currentZone -
            previousZone
        );

      changeBackground(
        crossedBoundaries
      );
    };

    const handleScroll = (): void => {
      if (
        scrollTickingRef.current
      ) {
        return;
      }

      scrollTickingRef.current =
        true;

      window.requestAnimationFrame(
        () => {
          updateBackground();

          scrollTickingRef.current =
            false;
        }
      );
    };

    const handleResize = (): void => {
      updateBackground();
    };

    /*
     * Initialize the current scroll zone.
     */
    previousScrollZoneRef.current =
      getScrollZone();

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      if (
        fadeTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          fadeTimeoutRef.current
        );
      }
    };
  }, []);

  /* ==========================================
     FILTER + SORT
  ========================================== */

  const filteredAndSortedProducts =
    useMemo(() => {
      let filtered = [...products];

      if (
        selectedModel !== 'همه'
      ) {
        if (
          selectedModel === 'سایر'
        ) {
          filtered =
            filtered.filter(
              (p) =>
                !MODELS
                  .slice(0, -1)
                  .includes(p.model)
            );

          if (customModel) {
            filtered =
              filtered.filter(
                (p) =>
                  p.model
                    .toLowerCase()
                    .includes(
                      customModel.toLowerCase()
                    )
              );
          }
        } else {
          filtered =
            filtered.filter(
              (p) =>
                p.model ===
                selectedModel
            );
        }
      }

      if (
        selectedType !== 'همه'
      ) {
        filtered =
          filtered.filter(
            (p) =>
              getProductGoodsType(p) ===
              selectedType
          );
      }

      if (
        selectedColor !== 'همه'
      ) {
        filtered =
          filtered.filter(
            (p) =>
              p.color ===
              selectedColor
          );
      }

      if (
        selectedTag !== 'همه'
      ) {
        filtered =
          filtered.filter(
            (p) =>
              p.tags.includes(
                selectedTag
              )
          );
      }

      if (
        sortBy === 'price-asc'
      ) {
        filtered.sort(
          (a, b) =>
            a.price -
            b.price
        );
      } else if (
        sortBy === 'price-desc'
      ) {
        filtered.sort(
          (a, b) =>
            b.price -
            a.price
        );
      }

      return filtered;
    }, [
      products,
      selectedModel,
      selectedType,
      selectedColor,
      selectedTag,
      sortBy,
      customModel,
    ]);

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <div className="loading-center">
        <img
          src="/loading.gif"
          alt="در حال بارگذاری..."
          className="loading-gif"
        />

        <p>
          در حال بارگذاری...
        </p>
      </div>
    );
  }

  /* ==========================================
     ERROR
  ========================================== */

  if (error) {
    return (
      <div className="products-page">

        <div
          className="products-background"
          aria-hidden="true"
        >
          <div
            className="products-background-layer products-background-current"
            style={{
              backgroundColor:
                BACKGROUND_COLORS[
                  currentBackgroundIndex
                ],
            }}
          />
        </div>

        <div className="container">
          <div className="products-empty">
            <h2 className="products-empty-title">
              ⚠️ خطا در اتصال به سرور
            </h2>

            <p className="products-empty-text">
              {error}
            </p>

            <p
              className="products-empty-text"
              style={{
                marginTop: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {getApiErrorHint(error)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================
     MAIN PAGE
  ========================================== */

  return (
    <div className="products-page">

      {/* ======================================
          FIXED BACKGROUND
      ====================================== */}

      <div
        className="products-background"
        aria-hidden="true"
      >

        {previousBackgroundIndex !==
          null && (
          <div
            className="products-background-layer products-background-previous"
            style={{
              backgroundColor:
                BACKGROUND_COLORS[
                  previousBackgroundIndex
                ],
            }}
          />
        )}

        <div
          key={backgroundTransitionKey}
          className="products-background-layer products-background-current"
          style={{
            backgroundColor:
              BACKGROUND_COLORS[
                currentBackgroundIndex
              ],
          }}
        />

      </div>

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="container">

        <h1 className="products-title">
          لیست محصولات
        </h1>

        {/* ====================================
            MOBILE SEARCH BUTTON
        ==================================== */}

        <button
          type="button"
          className="mobile-search-toggle"
          onClick={() =>
            setIsMobileFiltersOpen(
              (current) =>
                !current
            )
          }
          aria-expanded={
            isMobileFiltersOpen
          }
          aria-controls="products-filters"
        >
          {isMobileFiltersOpen ? (
            <X size={17} />
          ) : (
            <Search size={17} />
          )}

          <span>
            {isMobileFiltersOpen
              ? 'بستن جستجو'
              : 'جستجو'}
          </span>
        </button>

        {/* ====================================
            FILTERS
        ==================================== */}

        <div
          id="products-filters"
          className={`products-filters ${
            isMobileFiltersOpen
              ? 'mobile-filters-open'
              : ''
          }`}
        >

          <div className="filter-group">
            <label>
              مدل:
            </label>

            <select
              value={selectedModel}
              onChange={(e) =>
                setSelectedModel(
                  e.target.value
                )
              }
            >
              <option value="همه">
                همه
              </option>

              {MODELS.map(
                (model) => (
                  <option
                    key={model}
                    value={model}
                  >
                    {model}
                  </option>
                )
              )}
            </select>

            {selectedModel ===
              'سایر' && (
              <input
                type="text"
                placeholder="نام مدل را وارد کنید"
                value={customModel}
                onChange={(e) =>
                  setCustomModel(
                    e.target.value
                  )
                }
                className="custom-input"
              />
            )}
          </div>

          <div className="filter-group">
            <label>
              نوع کالا:
            </label>

            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(
                  e.target.value
                )
              }
            >
              <option value="همه">
                همه
              </option>

              {TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>
              رنگ:
            </label>

            <select
              value={selectedColor}
              onChange={(e) =>
                setSelectedColor(
                  e.target.value
                )
              }
            >
              <option value="همه">
                همه
              </option>

              {COLORS.map(
                (color) => (
                  <option
                    key={color}
                    value={color}
                  >
                    {color}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>
              تگ:
            </label>

            <select
              value={selectedTag}
              onChange={(e) =>
                setSelectedTag(
                  e.target.value
                )
              }
            >
              <option value="همه">
                همه
              </option>

              {TAGS.map(
                (tag) => (
                  <option
                    key={tag}
                    value={tag}
                  >
                    {tag}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>
              مرتب‌سازی:
            </label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'price-asc'
                    | 'price-desc'
                    | 'none'
                )
              }
            >
              <option value="none">
                بدون مرتب‌سازی
              </option>

              <option value="price-asc">
                قیمت: کم به زیاد
              </option>

              <option value="price-desc">
                قیمت: زیاد به کم
              </option>
            </select>
          </div>

        </div>

        {/* ====================================
            REPLACEMENT PROGRAM
        ==================================== */}

        <ReplacementProgramBanner />

        {/* ====================================
            PRODUCTS
        ==================================== */}

        {filteredAndSortedProducts.length ===
        0 ? (
          <div className="products-empty">
            <h2 className="products-empty-title">
              محصولی یافت نشد
            </h2>

            <p className="products-empty-text">
              با فیلترهای انتخابی شما محصولی
              موجود نیست.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredAndSortedProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductsPage;
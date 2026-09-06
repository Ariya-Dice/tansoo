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
   BACKGROUND IMAGES
========================================== */

const BACKGROUND_IMAGES = [
  '/back.jpg',
  '/02.jpg',
  '/03.jpg',
  '/04.jpg',
  '/05.jpg',
  '/06.jpg',
  '/07.jpg',
  '/08.jpg',
  '/09.jpg',
  '/10.jpg',
  '/11.jpg',
  '/12.jpg',
  '/13.jpg',
  '/14.jpg',
  '/15.jpg',
  '/16.jpg',
  '/17.jpg',
  '/18.jpg',
  '/19.jpg',
  '/20.jpg',
];

const PRELOAD_COUNT = 3;

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
   * Current image shown to the user.
   */
  const [currentBackgroundIndex, setCurrentBackgroundIndex] =
    useState<number>(0);

  /*
   * Previous image stays underneath while
   * the new image fades in.
   */
  const [previousBackgroundIndex, setPreviousBackgroundIndex] =
    useState<number | null>(null);

  /*
   * Incrementing this value restarts the
   * fade animation.
   */
  const [backgroundTransitionKey, setBackgroundTransitionKey] =
    useState<number>(0);

  /*
   * The image cursor is independent from
   * scroll direction.
   *
   * Every crossed boundary consumes one
   * new image.
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

  /*
   * Prevent excessive requestAnimationFrame
   * calls during scrolling.
   */
  const scrollTickingRef =
    useRef<boolean>(false);

  /*
   * Clear the old image after the Fade.
   */
  const fadeTimeoutRef =
    useRef<number | null>(null);

  /* ==========================================
     BACKGROUND PRELOAD
  ========================================== */

  const preloadImage = (
    imagePath: string
  ): void => {
    const image = new Image();
    image.src = imagePath;
  };

  const preloadBackgrounds = (
    startIndex: number
  ): void => {
    const endIndex = Math.min(
      startIndex + PRELOAD_COUNT,
      BACKGROUND_IMAGES.length
    );

    for (
      let index = startIndex;
      index < endIndex;
      index += 1
    ) {
      preloadImage(
        BACKGROUND_IMAGES[index]
      );
    }
  };

  /* ==========================================
     BACKGROUND SCROLL LOGIC
  ========================================== */

  useEffect(() => {
    /*
     * Initial preload.
     */
    preloadBackgrounds(0);

    const getScrollZone = (): number => {
      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight - viewportHeight;

      if (scrollableHeight <= 0) {
        return 0;
      }

      const progress =
        scrollTop / scrollableHeight;

      if (progress < 1 / 3) {
        return 0;
      }

      if (progress < 2 / 3) {
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

      const maxIndex =
        BACKGROUND_IMAGES.length - 1;

      /*
       * Every crossed boundary consumes
       * one new image.
       */
      const nextIndex = Math.min(
        currentIndex +
          crossedBoundaries,
        maxIndex
      );

      /*
       * No more unused images remain.
       */
      if (
        nextIndex === currentIndex
      ) {
        return;
      }

      /*
       * Keep current image underneath
       * the incoming image.
       */
      setPreviousBackgroundIndex(
        currentIndex
      );

      /*
       * Advance the global image cursor.
       */
      backgroundCursorRef.current =
        nextIndex;

      /*
       * Activate the new image.
       */
      setCurrentBackgroundIndex(
        nextIndex
      );

      /*
       * Restart Fade animation.
       */
      setBackgroundTransitionKey(
        (value) => value + 1
      );

      /*
       * Preload the next images.
       */
      preloadBackgrounds(
        nextIndex + 1
      );

      /*
       * Remove the previous layer after
       * the animation has completed.
       */
      if (
        fadeTimeoutRef.current !== null
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
        }, 950);
    };

    const updateBackground = (): void => {
      const currentZone =
        getScrollZone();

      const previousZone =
        previousScrollZoneRef.current;

      if (
        currentZone === previousZone
      ) {
        return;
      }

      /*
       * Save the new zone.
       */
      previousScrollZoneRef.current =
        currentZone;

      /*
       * Direction does NOT determine
       * the image.
       *
       * Every boundary crossing consumes
       * another image.
       *
       * 0 -> 1 = +1
       * 1 -> 2 = +1
       * 2 -> 1 = +1
       * 1 -> 0 = +1
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

      window.requestAnimationFrame(() => {
        updateBackground();

        scrollTickingRef.current =
          false;
      });
    };

    const handleResize = (): void => {
      updateBackground();
    };

    /*
     * Set the correct initial zone.
     */
    previousScrollZoneRef.current =
      getScrollZone();

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
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

      /* Model */
      if (
        selectedModel !== 'همه'
      ) {
        if (
          selectedModel === 'سایر'
        ) {
          filtered = filtered.filter(
            (p) =>
              !MODELS
                .slice(0, -1)
                .includes(p.model)
          );

          if (customModel) {
            filtered = filtered.filter(
              (p) =>
                p.model
                  .toLowerCase()
                  .includes(
                    customModel.toLowerCase()
                  )
            );
          }
        } else {
          filtered = filtered.filter(
            (p) =>
              p.model ===
              selectedModel
          );
        }
      }

      /* Type */
      if (
        selectedType !== 'همه'
      ) {
        filtered = filtered.filter(
          (p) =>
            getProductGoodsType(p) ===
            selectedType
        );
      }

      /* Color */
      if (
        selectedColor !== 'همه'
      ) {
        filtered = filtered.filter(
          (p) =>
            p.color ===
            selectedColor
        );
      }

      /* Tag */
      if (
        selectedTag !== 'همه'
      ) {
        filtered = filtered.filter(
          (p) =>
            p.tags.includes(
              selectedTag
            )
        );
      }

      /* Sorting */
      if (
        sortBy === 'price-asc'
      ) {
        filtered.sort(
          (a, b) =>
            a.price - b.price
        );
      } else if (
        sortBy === 'price-desc'
      ) {
        filtered.sort(
          (a, b) =>
            b.price - a.price
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
              backgroundImage: `
                linear-gradient(
                  180deg,
                  rgba(7, 15, 24, 0.72) 0%,
                  rgba(7, 15, 24, 0.42) 45%,
                  rgba(7, 15, 24, 0.70) 100%
                ),
                url("${BACKGROUND_IMAGES[currentBackgroundIndex]}")
              `,
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

      {/* Fixed Background */}

      <div
        className="products-background"
        aria-hidden="true"
      >
        {previousBackgroundIndex !==
          null && (
          <div
            className="products-background-layer products-background-previous"
            style={{
              backgroundImage: `
                linear-gradient(
                  180deg,
                  rgba(7, 15, 24, 0.72) 0%,
                  rgba(7, 15, 24, 0.42) 45%,
                  rgba(7, 15, 24, 0.70) 100%
                ),
                url("${BACKGROUND_IMAGES[previousBackgroundIndex]}")
              `,
            }}
          />
        )}

        <div
          key={backgroundTransitionKey}
          className="products-background-layer products-background-current"
          style={{
            backgroundImage: `
              linear-gradient(
                180deg,
                rgba(7, 15, 24, 0.72) 0%,
                rgba(7, 15, 24, 0.42) 45%,
                rgba(7, 15, 24, 0.70) 100%
              ),
              url("${BACKGROUND_IMAGES[currentBackgroundIndex]}")
            `,
          }}
        />
      </div>

      <div className="container">

        {/* ====================================
            TITLE
        ==================================== */}

        <h1 className="products-title">
          لیست محصولات
        </h1>

        {/* ====================================
            MOBILE SEARCH
        ==================================== */}

        <button
          type="button"
          className="mobile-search-toggle"
          onClick={() =>
            setIsMobileFiltersOpen(
              (current) => !current
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
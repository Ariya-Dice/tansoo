// src/pages/AboutPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Hammer,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { STORE_NAME } from '../constants';

import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">

      <div className="container">

        {/* =========================
            Hero
        ========================= */}

        <header className="about-hero">

          <div className="about-watermark">
            ARIA
          </div>

          <div className="about-badge">

            <Award size={18} />

            <span>
              داستان یک آفرینش؛ اصالت صنعتگری ایرانی
            </span>

          </div>

          <h1 className="about-title">
فروشگاه آربی          </h1>

          <p className="about-subtitle">
            ما در{STORE_NAME}، شیرآلات را صرفاً یک ابزار کاربردی
            نمی‌دانیم؛ بلکه آن‌ها را بخشی از زیبایی خانه،
            کیفیت زندگی و آرامش خانواده‌های ایرانی می‌دانیم.
          </p>

        </header>

        {/* =========================
            Story Section
        ========================= */}

        <section className="about-story">

          {/* متن */}

          <div className="story-content">

            <div className="story-heading">

              <h2>
                شعار ما؛ از کوره ریخته‌گری تا خانه‌های شما
              </h2>

              <span>
تاسیس 1404              </span>

            </div>

            <p>
              فروشگاه آربی  با یک هدف
              مشخص فعالیت خود را آغاز کرد؛ فروش محصولاتی که کیفیت،
              دوام و زیبایی آن‌ها در حد استانداردهای جهانی باشد و
              بتوانند سال‌ها بدون افت کیفیت در خانه‌های ایرانی مورد
              استفاده قرار گیرند.
            </p>

            <div className="story-features">

              <div className="story-feature">

                <CheckCircle2 size={18} />

                <span>
                  دارای استاندارد ملی ایران
                </span>

              </div>

              <div className="story-feature">

                <CheckCircle2 size={18} />

                <span>
                  استفاده از آلیاژ برنج بدون سرب
                </span>

              </div>

              <div className="story-feature">

                <CheckCircle2 size={18} />

                <span>
                  ضمانت تعویض واقعی پنج ساله
                </span>

              </div>

              <div className="story-feature">

                <CheckCircle2 size={18} />

                <span>
                  کارتریج سرامیکی با دوام بالا
                </span>

              </div>

            </div>

          </div>

          {/* کارت سمت چپ */}

          <aside className="story-card">

            <div className="story-card-icon">

              <Hammer size={46} />

            </div>

            <h3>
              خرید مستقیم از کارگاه
            </h3>

            <p className="story-card-subtitle">
              بدون واسطه • تحویل مستقیم به مصرف‌کننده
            </p>

            <div className="story-card-box">

              <div className="story-card-box-title">

                <Star
                  size={16}
                  fill="currentColor"
                />

                <span>
                  چرا خرید مستقیم؟
                </span>

              </div>

              <p>
                حذف واسطه‌ها و فروش مستقیم از کارخانه باعث
                شده محصولات فروشگاه آربی با همان کیفیت برندهای لوکس
                بازار و با قیمت مناسب‌تر در اختیار مصرف‌کننده
                قرار گیرد.
              </p>

            </div>

          </aside>

        </section>

        {/* =========================
            ارزش‌های بنیادین
        ========================= */}

<section className="about-values">

<h2 className="values-title">
  ارزش‌های بنیادین فروشگاه ما
</h2>

<div className="values-grid">

  {/* کارت اول */}

  <article className="value-card">

    <div className="value-icon value-icon-red">
      🔥
    </div>

    <h3>
      سلامت‌محور و بدون سرب
    </h3>

    <p>
      سلامت مصرف‌کنندگان برای ما در اولویت است.
      تمامی محصولات با استفاده از شمش برنج استاندارد
      و با حداقل میزان سرب تولید می‌شوند تا کیفیت آب
      آشامیدنی حفظ شود و محصولی ایمن در اختیار خانواده‌ها
      قرار گیرد.
    </p>

  </article>

  {/* کارت دوم */}

  <article className="value-card">

    <div className="value-icon value-icon-blue">
      🛡️
    </div>

    <h3>
      ضمانت واقعی پنج ساله
    </h3>

    <p>
      هر محصول پیش از خروج از کارخانه تحت آزمایش‌های
      فشار، نشتی و کنترل کیفیت قرار می‌گیرد و همراه با
      کارت ضمانت معتبر برای مشتری ارسال می‌شود.
    </p>

  </article>

  {/* کارت سوم */}

  <article className="value-card">

    <div className="value-icon value-icon-green">
      ✨
    </div>

    <h3>
      آبکاری حرفه‌ای و ماندگار
    </h3>

    <p>
      استفاده از فناوری‌های نوین آبکاری باعث شده رنگ،
      درخشندگی و مقاومت محصولات در برابر رطوبت،
      رسوبات و خط و خش در طول سال‌ها حفظ شود.
    </p>

  </article>

</div>

</section>

{/* =========================
  تماس با کارگاه
========================= */}

<section className="about-contact">

<div className="contact-content">

  <div className="contact-info">

    <h2>
      ارتباط مستقیم با فروشگاه و پشتیبانی فروش
    </h2>

    <p>
      اگر برای انتخاب محصول، نصب، خدمات پس از فروش،
      سفارش عمده، نیاز به راهنمایی
      دارید،  فروشگاه ما آماده پاسخگویی به شماست.
    </p>

  </div>

  <div className="contact-card">

    <div className="contact-item">

      <span className="contact-icon">
        📍
      </span>

      <span>
        دفتر فروش و کارگاه:
        اردبیل - شهرک مخابرات - طلاییه - طلاییه شرقی ۴
      </span>

    </div>

    <div className="contact-item">

      <span className="contact-icon">
        📞
      </span>

      <a href="tel:09368013251">
        09368013251
      </a>

    </div>

    <div className="contact-item">

      <span className="contact-icon">
        ✉️
      </span>

      <a href="rbshop@gmail.com">
      rbshop@gmail.com
      </a>

    </div>

    <div className="contact-item">

      <span className="contact-icon">
        🕒
      </span>

      <span>
        شنبه تا پنجشنبه
        <br />
        ۸ صبح تا ۵ عصر
      </span>

    </div>

  </div>

</div>

</section>

{/* =========================
  Footer
========================= */}

<div className="about-footer">

<Link
  to="/"
  className="about-back-button"
>
  بازگشت به صفحه اصلی
</Link>

</div>

</div>

</div>
);
};

export default AboutPage;
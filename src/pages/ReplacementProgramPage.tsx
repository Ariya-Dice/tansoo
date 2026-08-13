import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ReplacementProgramPage.css';

const PAGE_TITLE = 'طرح تعویض شیرآلات کهنه با نو | فروشگاه اربی';
const PAGE_DESCRIPTION =
  'با طرح تعویض شیرآلات کهنه با نو فروشگاه اربی، شیرآلات جدید خود را خریداری کنید و پس از تعویض، شیرآلات کهنه خود را برای ما ارسال کنید.';

const ReplacementProgramPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content') ?? '';
    metaDescription?.setAttribute('content', PAGE_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      metaDescription?.setAttribute('content', previousDescription);
    };
  }, []);

  return (
    <div className="replacement-program-page">
      <div className="container">
        <header className="replacement-program-hero">
          <h1 className="replacement-program-title">
            طرح تعویض شیرآلات کهنه با نو
          </h1>
          <p className="replacement-program-intro">
            اگر از شیرآلات آب کهنه و فرسوده خود خسته شده‌اید و دوست دارید با هزینه کمتری آن‌ها را با شیرآلات جدید و اهرمی تعویض کنید، ما اینجا هستیم تا این کار را برای شما آسان‌تر کنیم.
          </p>
        </header>

        <div className="replacement-program-steps">
          <section className="replacement-program-step">
            <h2>۱. هنگام خرید، طرح تعویض را انتخاب کنید</h2>
            <p>
              هنگام خرید شیرآلات، کافی است گزینه «طرح تعویض شیرآلات کهنه با نو» را در سبد خرید فعال کنید.
              پس از آن، مبلغ خرید شیرآلات جدید را به صورت کامل پرداخت می‌کنید و ما شیرآلات خریداری‌شده را برای شما ارسال می‌کنیم.
            </p>
          </section>

          <section className="replacement-program-step">
            <h2>۲. ۱۵ روز برای تعویض فرصت دارید</h2>
            <p>
              پس از رسیدن شیرآلات اهرمی جدید به دست شما، ۱۵ روز فرصت دارید تا شیرآلات جدید را جایگزین شیرآلات قدیمی خود کنید.
              پس از انجام تعویض، شیرآلات کهنه خود را برای ما ارسال کنید.
            </p>
          </section>

          <section className="replacement-program-step">
            <h2>۳. بررسی و جداسازی قطعات</h2>
            <p>
              پس از دریافت شیرآلات کهنه توسط ما، قطعات غیر برنجی آن‌ها جدا می‌شوند و قطعات برنجی توزین خواهند شد.
              سپس ارزش قطعات برنجی بر اساس وزن آن‌ها محاسبه می‌شود.
            </p>
          </section>

          <section className="replacement-program-step">
            <h2>۴. بازگشت مبلغ قطعات برنجی</h2>
            <p>
              مبلغ محاسبه‌شده برای قطعات برنجی از مبلغ پرداختی شما بابت خرید کسر می‌شود و باقی‌مانده مبلغ به حساب شما بازگردانده خواهد شد.
            </p>
          </section>

          <section className="replacement-program-step">
            <h2>۵. هزینه ارسال شیرآلات کهنه</h2>
            <p>
              پس از آماده‌سازی شیرآلات کهنه برای ارسال، هزینه ارسال آن‌ها به فروشگاه بر عهده مشتری است.
              این هزینه از ارزش محاسبه‌شده شیرآلات کهنه کسر خواهد شد و مبلغ نهایی پس از کسر هزینه ارسال، به حساب شما بازگردانده می‌شود.
            </p>
            <p className="replacement-program-warning-inline">
              فروشگاه اربی هیچ‌گونه مسئولیتی در قبال هزینه ارسال شیرآلات کهنه ندارد.
            </p>
          </section>
        </div>

        <section className="replacement-program-info-box">
          <h2>اطمینان از فرآیند محاسبه</h2>
          <p>
            شما نیز می‌توانید قبل از ارسال شیرآلات کهنه، قطعات برنجی آن‌ها را جدا و وزن کنید تا بتوانید وزن تقریبی قطعات برنجی را از قبل بررسی کرده و از صحت فرآیند اطمینان حاصل کنید.
          </p>
        </section>

        <section className="replacement-program-deadline-alert" role="alert">
          <h2>⚠️ مهلت استفاده از طرح</h2>
          <p className="replacement-program-deadline-primary">
            مهلت انجام طرح فقط ۱۵ روز است و به هیچ عنوان قابل تمدید نیست.
          </p>
          <p className="replacement-program-deadline-secondary">
            به مرسولاتی که بیش از دو هفته از تاریخ سفارش آن‌ها گذشته باشد، ترتیب اثر داده نخواهد شد.
          </p>
        </section>

        <section className="replacement-program-ardabil">
          <h2>مراجعه حضوری در اردبیل</h2>
          <p>
            این طرح در شهر اردبیل به صورت حضوری نیز قابل انجام است.
          </p>
        </section>

        <div className="replacement-program-footer">
          <Link to="/products" className="replacement-program-cta-btn">
            مشاهده محصولات
          </Link>
          <Link to="/" className="replacement-program-back-link">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReplacementProgramPage;

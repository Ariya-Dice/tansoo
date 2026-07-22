import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Mail,
  Clock,
  User,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { STORE_NAME } from '../constants';
import './ContactPage.css';

const PHONE = '09368013251';
const PHONE_DISPLAY = '09368013251';

const EMAIL = 'rbshop@gmail.com';

const ADDRESS =
  'اردبیل - شهرک مخابرات - طلاییه - طلاییه شرقی ۴';

const MANAGER = 'بردیا عبداللهیان';

const MAP_LAT = 38.215555;
const MAP_LNG = 48.311236;

const MAP_EMBED_URL = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&hl=fa&z=17&output=embed`;

const MAP_LINK_URL = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}`;

const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="container">

        <header className="contact-hero">

          <span className="contact-badge">
            ارتباط مستقیم با فروشگاه
          </span>

          <h1>
            ارتباط با {STORE_NAME}
          </h1>

          <p>
            برای دریافت مشاوره خرید، استعلام قیمت، سفارش عمده،
            خدمات پس از فروش و راهنمایی انتخاب محصول، کارشناسان
            فروشگاه آربی آماده پاسخگویی به شما هستند.
          </p>

        </header>

        <div className="contact-grid">

          <section className="contact-card contact-card--info">

            <h2 className="contact-card-title">
              اطلاعات تماس
            </h2>

            <div className="contact-list">

              <div className="contact-item">

                <div className="contact-icon">
                  <User size={20} />
                </div>

                <div>
                  <span className="contact-item-label">
                    مدیریت
                  </span>

                  <p className="contact-item-value">
                    {MANAGER}
                  </p>

                </div>

              </div>

              <div className="contact-item">

                <div className="contact-icon">
                  <Phone size={20} />
                </div>

                <div>

                  <span className="contact-item-label">
                    شماره تماس
                  </span>

                  <a
                    href={`tel:${PHONE}`}
                    className="contact-phone"
                  >
                    {PHONE_DISPLAY}
                  </a>

                </div>

              </div>

              <div className="contact-item">

                <div className="contact-icon">
                  <Mail size={20} />
                </div>

                <div>

                  <span className="contact-item-label">
                    ایمیل
                  </span>

                  <a
                    href={`mailto:${EMAIL}`}
                    className="contact-email"
                  >
                    {EMAIL}
                  </a>

                </div>

              </div>

              <div className="contact-item">

                <div className="contact-icon">
                  <MapPin size={20} />
                </div>

                <div>

                  <span className="contact-item-label">
                    آدرس فروشگاه
                  </span>

                  <p className="contact-item-value contact-address">
                    {ADDRESS}
                  </p>

                </div>

              </div>

              <div className="contact-item">

                <div className="contact-icon">
                  <Clock size={20} />
                </div>

                <div>

                  <span className="contact-item-label">
                    ساعات پاسخگویی
                  </span>

                  <p className="contact-item-value">
                    شنبه تا پنجشنبه
                    <br />
                    ۸ صبح تا ۵ عصر
                  </p>

                </div>

              </div>

            </div>

            <div className="contact-actions">

              <a
                href={`tel:${PHONE}`}
                className="contact-btn contact-btn-primary"
              >
                <Phone size={18} />
                تماس تلفنی
              </a>

              <a
                href={MAP_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn contact-btn-secondary"
              >
                <Navigation size={18} />
                مسیریابی
              </a>

            </div>

          </section>

          <section className="contact-card contact-card--map">

            <h2 className="contact-card-title">
              موقعیت فروشگاه
            </h2>

            <p className="contact-map-hint">
              برای مشاهده مسیر دقیق، روی نقشه زوم کنید یا از
              دکمه مسیریابی استفاده نمایید.
            </p>

            <div className="contact-map-wrap">

              <iframe
                title="RB Shop Location"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

            </div>

          </section>

        </div>

        <section className="contact-support">

          <h2>
            نیاز به راهنمایی دارید؟
          </h2>

          <p>
            اگر برای انتخاب مدل مناسب شیرآلات یا ثبت سفارش سوالی
            دارید، فروشگاه آربی آماده پاسخگویی به شماست.
          </p>

          <div className="contact-support-actions">

            <a
              href={`tel:${PHONE}`}
              className="contact-btn contact-btn-primary"
            >
              تماس با پشتیبانی
            </a>

            <Link
              to="/products"
              className="contact-btn contact-btn-secondary"
            >
              مشاهده محصولات
            </Link>

          </div>

        </section>

        <div className="contact-back">

          <Link to="/">
            <ArrowRight size={18} />
            بازگشت به صفحه اصلی
          </Link>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
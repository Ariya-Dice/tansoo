import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';
import './ContactPage.css';

const PHONE = '09368013251';
const PHONE_DISPLAY = '۰۹۳۶۸۰۱۳۲۵۱';
const ADDRESS = 'اردبیل - شهرک مخابرات - طلاییه - طلاییه شرقی ۴';
const MANAGER = 'مهندس بهرامی';
const MAP_LAT = 38.215555;
const MAP_LNG = 48.311236;
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&hl=fa&z=17&output=embed`;
const MAP_LINK_URL = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}`;

const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="container">
        <header className="contact-header">
          <h1 className="contact-title">ارتباط با ما</h1>
          <p className="contact-subtitle">
            برای مشاوره، سفارش یا بازدید از کارگاه با {STORE_NAME} در تماس باشید.
          </p>
        </header>

        <div className="contact-grid">
          <section className="contact-card contact-card--info">
            <h2 className="contact-card-title">اطلاعات تماس</h2>

            <div className="contact-item">
              <span className="contact-item-label">مدیریت</span>
              <p className="contact-item-value">{MANAGER}</p>
            </div>

            <div className="contact-item">
              <span className="contact-item-label">شماره تماس</span>
              <a href={`tel:${PHONE}`} className="contact-phone">
                {PHONE_DISPLAY}
              </a>
            </div>

            <div className="contact-item">
              <span className="contact-item-label">آدرس کارگاه</span>
              <p className="contact-item-value contact-address">{ADDRESS}</p>
            </div>

            <div className="contact-actions">
              <a href={`tel:${PHONE}`} className="contact-btn contact-btn-primary">
                تماس تلفنی
              </a>
              <a
                href={MAP_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn contact-btn-secondary"
              >
                مسیریابی در گوگل مپ
              </a>
            </div>
          </section>

          <section className="contact-card contact-card--map">
            <h2 className="contact-card-title">موقعیت کارگاه</h2>
            <p className="contact-map-hint">برای مشاهده دقیق‌تر، روی نقشه زوم کنید یا لینک مسیریابی را بزنید.</p>
            <div className="contact-map-wrap">
              <iframe
                title="موقعیت کارگاه تانسو روی گوگل مپ"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </section>
        </div>

        <p className="contact-back">
          <Link to="/">بازگشت به صفحه اصلی</Link>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;

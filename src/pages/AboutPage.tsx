import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="container">
        <header className="about-header">
          <h1 className="about-title">درباره ما</h1>
          <p className="about-subtitle">{STORE_NAME}</p>
        </header>

        <section className="about-content-card" aria-label="محتوای درباره ما">
          {/* محتوای این بخش بعداً جایگزین می‌شود */}
        </section>

        <p className="about-back">
          <Link to="/">بازگشت به صفحه اصلی</Link>
        </p>
      </div>
    </div>
  );
};

export default AboutPage;

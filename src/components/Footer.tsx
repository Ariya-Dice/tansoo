import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-info">
            <h3 className="footer-title">{STORE_NAME}</h3>
            <p className="footer-description">شیرآلات بهداشتی درجه یک</p>
            <p className="footer-description">
              <Link to="/about" className="footer-link">درباره ما</Link>
              {' · '}
              <Link to="/contact" className="footer-link">ارتباط با ما</Link>
              {' · '}
              <a href="tel:09368013251" className="footer-link">۰۹۳۶۸۰۱۳۲۵۱</a>
            </p>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} شیرآلات تانسو. تمامی حقوق محفوظ است.</p>
            <p><Link to="/admin" className="footer-link">پنل مدیریت</Link></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
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

            <p className="footer-description">فروشگاه آربی</p>

            <p className="footer-description">
              <Link to="/about" className="footer-link">
                درباره ما
              </Link>
              {'     '}
              <Link to="/contact" className="footer-link">
                ارتباط با ما
              </Link>
              {'     '}
              <a href="tel:0936" className="footer-link">
              </a>
            </p>
          </div>

          <div className="footer-enamad">
            <a
              referrerPolicy="origin"
              target="_blank"
              rel="noopener noreferrer"
              href="https://trustseal.enamad.ir/?id=759060&Code=kZTiAGVwyLU8KgsOi6cRNBOjLIaAWi0g"
            >
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=759060&Code=kZTiAGVwyLU8KgsOi6cRNBOjLIaAWi0g"
                alt="نماد اعتماد الکترونیکی"
                className="enamad-logo"
                data-code="kZTiAGVwyLU8KgsOi6cRNBOjLIaAWi0g"
              />
            </a>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} فروشگاه آربی. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark-blue text-brand-light-text border-t border-brand-neon-blue/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">{STORE_NAME}</h3>
            <p className="text-sm text-brand-muted-text">شیرآلات بهداشتی درجه یک</p>
          </div>
          <div className="text-sm text-brand-muted-text">
            <p>&copy; {new Date().getFullYear()} شیرآلات تانسو. تمام حقوق محفوظ است.</p>
            <p><Link to="/admin" className="hover:text-brand-neon-blue transition-colors">پنل مدیریت</Link></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
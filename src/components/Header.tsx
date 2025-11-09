import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBagIcon, MenuIcon, XIcon } from './icons';
import { STORE_NAME } from '../constants';
import './Header.css';

const Header: React.FC = () => {
  const { cartCount } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', name: 'خانه' },
    { path: '/products', name: 'محصولات' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">

          {/* Logo */}
          <div className="header-logo">
            <Link to="/" className="header-logo-link">
              {STORE_NAME}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Cart Icon */}
          <div className="header-cart">
            <Link to="/cart" className="header-cart-link">
              <ShoppingBagIcon />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="header-nav-mobile">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? 'mobile-menu-link active' : 'mobile-menu-link'
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

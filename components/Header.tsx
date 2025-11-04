
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBagIcon, MenuIcon, XIcon } from './icons';
import { STORE_NAME } from '../constants';

const Header: React.FC = () => {
  const { cartCount } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', name: 'خانه' },
    { path: '/products', name: 'محصولات' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-brand-neon-blue' : 'text-brand-muted-text hover:text-brand-neon-blue'} after:content-[''] after:absolute after:right-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-brand-neon-blue after:transform after:scale-x-0 after:transition-transform after:duration-300 ${isActive ? 'after:scale-x-100' : 'group-hover:after:scale-x-100'}`;
  
  return (
    <header className="sticky top-0 bg-brand-dark-blue/80 backdrop-blur-md border-b border-brand-neon-blue/20 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-brand-muted-text hover:text-brand-neon-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-neon-blue">
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-brand-light-text tracking-wider">
              {STORE_NAME}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Cart Icon */}
          <div className="flex items-center">
            <Link to="/cart" className="relative group p-2">
              <ShoppingBagIcon />
              {cartCount > 0 && (
                <span className="absolute top-0 left-0 block h-5 w-5 rounded-full bg-brand-neon-blue text-brand-dark-blue text-xs flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-brand-surface shadow-lg">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass} onClick={() => setIsMenuOpen(false)}>
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

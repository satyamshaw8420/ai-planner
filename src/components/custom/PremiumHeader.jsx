import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PremiumHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create Trip', path: '/create-trip' },
    { name: 'My Trip', path: '/trip-history' },
    { name: 'Destination', path: '/globe' },
    { name: 'Compare', path: '/compare' },
    { name: 'Offline', path: '/offline' },
    { name: 'Weather', path: '/weather' },
    { name: 'Community', path: '/social' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center ml-0 pl-4">
            <div 
              className="flex items-center"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <img src="/logo.svg" alt="TravelEase Logo" className="h-8" />
            </div>
          </div>

          {/* Desktop Navigation - Text only links */}
          <nav className="hidden md:flex md:space-x-8 pr-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`text-white !text-white font-medium hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 focus:border-0 ${
                  location.pathname === item.path 
                    ? 'font-medium text-blue-400 underline' 
                    : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center pr-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none focus:ring-0 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <span className="text-2xl !text-white">×</span>
              ) : (
                <span className="text-2xl !text-white">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Text only links */}
      {isMenuOpen && (
        <div className="md:hidden bg-black px-4 pb-4">
          <div className="flex flex-col space-y-3 pt-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-white !text-white font-medium py-2 hover:text-blue-400 hover:underline transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 ${
                  location.pathname === item.path 
                    ? 'font-medium text-blue-400 underline' 
                    : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default PremiumHeader;
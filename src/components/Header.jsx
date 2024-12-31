import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiSearch, HiCalendar, HiMail, HiUser, HiMenu, HiX } from 'react-icons/hi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: HiHome },
    { path: '/opportunities', label: 'Opportunities', icon: HiSearch },
    { path: '/calendar', label: 'Calendar', icon: HiCalendar },
    { path: '/email', label: 'Email Generator', icon: HiMail },
    { path: '/profile', label: 'Profile', icon: HiUser }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Glassmorphic effect container */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#1e3a8a]/80 backdrop-blur-md border-b border-blue-700/30"></div>
          
          {/* Header content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <NavLink to="/" className="flex items-center space-x-2 group">
                <div className="transform group-hover:scale-110 transition-transform duration-200">
                  <span className="text-3xl" role="img" aria-label="Avocado">🥑</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  AvocadoSpace
                </span>
              </NavLink>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `
                      flex items-center space-x-2 px-4 py-2 rounded-xl
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'text-blue-300 hover:bg-blue-500/10 hover:text-blue-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg bg-blue-500/20 text-blue-400"
              >
                {isMenuOpen ? (
                  <HiX className="w-6 h-6" />
                ) : (
                  <HiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1e1e3f]/80 backdrop-blur-sm" onClick={toggleMenu}></div>
          
          {/* Menu */}
          <nav className="absolute right-0 top-16 w-64 bg-[#1e3a8a] border-l border-blue-700/30 h-[calc(100vh-4rem)] p-4">
            <div className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={toggleMenu}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-xl w-full
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-blue-300 hover:bg-blue-500/10 hover:text-blue-400'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;

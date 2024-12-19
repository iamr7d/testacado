import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiSearch, HiCalendar, HiMail, HiUser, HiAcademicCap, HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

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
              <NavLink to="/" className="flex items-center space-x-2">
                <HiAcademicCap className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                      flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-500/20 text-blue-400 scale-105' 
                        : 'text-blue-300 hover:bg-blue-500/10 hover:text-blue-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg text-blue-300 hover:bg-blue-500/10 hover:text-blue-400"
              >
                {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative md:hidden"
            >
              <div className="absolute inset-0 bg-[#1e3a8a]/95 backdrop-blur-md"></div>
              <nav className="relative py-4 px-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;

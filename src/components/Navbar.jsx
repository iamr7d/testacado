import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiAcademicCap, HiCalendar, HiMail, HiUser } from 'react-icons/hi';
import RocketLogo from './RocketLogo';

const NavLink = ({ to, icon: Icon, label, isActive }) => (
  <Link to={to}>
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-300 ${
        isActive 
          ? 'bg-[#58CC02] text-white font-bold' 
          : 'text-white/80 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </motion.div>
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-[#235390] shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10">
              <RocketLogo />
            </div>
            <span className="text-2xl font-bold text-white">
              Avocado<span className="text-[#58CC02]">Space</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" icon={HiHome} label="Home" isActive={isActive('/')} />
            <NavLink 
              to="/opportunities" 
              icon={HiAcademicCap} 
              label="Opportunities" 
              isActive={isActive('/opportunities')} 
            />
            <NavLink 
              to="/calendar" 
              icon={HiCalendar} 
              label="Calendar" 
              isActive={isActive('/calendar')} 
            />
            <NavLink 
              to="/email-generator" 
              icon={HiMail} 
              label="Email Generator" 
              isActive={isActive('/email-generator')} 
            />
          </div>

          {/* Right Side - Profile & Launch */}
          <div className="flex items-center gap-4">
            <NavLink 
              to="/profile" 
              icon={HiUser} 
              label="Profile" 
              isActive={isActive('/profile')} 
            />
            <Link to="/launch">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#58CC02] text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-[#58CC02]/20 hover:bg-[#46a302] transition-colors duration-300"
              >
                Launch App
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

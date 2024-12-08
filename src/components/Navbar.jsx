import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCalendar, BsBook, BsPerson, BsBell, BsX } from 'react-icons/bs';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'New PhD opportunity deadline approaching',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      message: 'Profile update reminder',
      time: '1 day ago',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setShowNotifications(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <span role="img" aria-label="avocado" className="text-2xl mr-2">🥑</span>
                <span className="font-bold text-xl text-green-600">Avocado Space</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/calendar"
              className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-green-50"
            >
              <BsCalendar className="mr-2" />
              Calendar
            </Link>
            <Link
              to="/opportunities"
              className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-green-50"
            >
              <BsBook className="mr-2" />
              Opportunities
            </Link>
            
            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-green-50"
              >
                <BsBell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                              !notification.read ? 'bg-green-50' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-600">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/profile"
              className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-green-50"
            >
              <BsPerson className="mr-2" />
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <BsX className="block h-6 w-6" />
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/calendar"
                className="flex items-center text-gray-600 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <BsCalendar className="mr-2" />
                Calendar
              </Link>
              <Link
                to="/opportunities"
                className="flex items-center text-gray-600 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <BsBook className="mr-2" />
                Opportunities
              </Link>
              <Link
                to="/profile"
                className="flex items-center text-gray-600 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <BsPerson className="mr-2" />
                Profile
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

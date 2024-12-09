import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaSearch, FaCalendar, FaUser, FaEnvelope } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import Home from './pages/Home';
import Calendar from './components/Calendar';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import EmailGenerator from './pages/EmailGenerator';

function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <motion.img
                    src="/avocado-logo.png"
                    alt="Avocado Space"
                    className="h-8 w-8"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <span className="text-xl font-bold text-indigo-600">Avocado Space</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <NavLink to="/" icon={<FaHome />} text="Home" />
                <NavLink to="/opportunities" icon={<FaSearch />} text="Opportunities" />
                <NavLink to="/calendar" icon={<FaCalendar />} text="Calendar" />
                <NavLink to="/email-generator" icon={<FaEnvelope />} text="Email Generator" />
                <NavLink to="/profile" icon={<FaUser />} text="Profile" />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/email-generator" element={<EmailGenerator />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const NavLink = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
  >
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex items-center gap-2"
    >
      {icon}
      {text}
    </motion.div>
  </Link>
);

export default App;

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiMail, HiCalendar, HiLightningBolt } from 'react-icons/hi';
import SpaceBackground from '../components/SpaceBackground';

const FeatureCard = ({ icon: Icon, title, description, to }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="bg-[#58CC02] w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <Link
      to={to}
      className="inline-flex items-center text-[#58CC02] font-bold hover:text-[#46a302] transition-colors"
    >
      Learn more →
    </Link>
  </motion.div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#235390] relative overflow-hidden">
      <SpaceBackground />
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Find Your Perfect
              <span className="text-[#58CC02]"> PhD Opportunity</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Your journey to academic excellence starts here. Discover, apply, and succeed
              with our comprehensive PhD search platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/opportunities">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#58CC02] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#58CC02]/20 hover:bg-[#46a302] transition-colors duration-300"
                >
                  Explore Opportunities
                </motion.button>
              </Link>
              <Link to="/email-generator">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors duration-300"
                >
                  Generate Email
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={HiAcademicCap}
              title="PhD Opportunities"
              description="Browse through hundreds of PhD positions from top universities worldwide."
              to="/opportunities"
            />
            <FeatureCard
              icon={HiMail}
              title="Email Generator"
              description="Create professional emails to reach out to potential supervisors."
              to="/email-generator"
            />
            <FeatureCard
              icon={HiCalendar}
              title="Deadline Tracker"
              description="Never miss an application deadline with our smart calendar."
              to="/calendar"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold text-[#58CC02] mb-2">500+</h3>
                <p className="text-white/80">Active Opportunities</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-[#58CC02] mb-2">50+</h3>
                <p className="text-white/80">Universities</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-[#58CC02] mb-2">1000+</h3>
                <p className="text-white/80">Happy Students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiCalendar, HiMail, HiLightningBolt, HiSearch } from 'react-icons/hi';
import Header from '../components/Header';

const Home = () => {
  const features = [
    {
      icon: HiAcademicCap,
      title: 'PhD Opportunities',
      description: 'Discover research opportunities from top universities worldwide',
      link: '/opportunities'
    },
    {
      icon: HiCalendar,
      title: 'Application Calendar',
      description: 'Track application deadlines and important dates',
      link: '/calendar'
    },
    {
      icon: HiMail,
      title: 'Email Generator',
      description: 'Create professional emails for research inquiries',
      link: '/email'
    },
    {
      icon: HiLightningBolt,
      title: 'AI Research Analysis',
      description: 'Get AI-powered insights on research opportunities',
      link: '/opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e3f]">
      <Header />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Find Your Perfect PhD Opportunity
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Use AI-powered search to discover and analyze research opportunities that match your interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for research opportunities..."
              className="w-full bg-[#1e3a8a]/50 text-white placeholder-blue-400 border border-blue-700/30 rounded-2xl py-4 px-6 pl-14 text-lg focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <HiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-400" />
            <Link
              to="/opportunities"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Search
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="group bg-[#1e3a8a]/50 border border-blue-700/30 rounded-2xl p-6 hover:bg-[#1e3a8a]/70 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-blue-200">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Universities', value: '500+' },
            { label: 'Countries', value: '50+' },
            { label: 'Opportunities', value: '1000+' },
            { label: 'Research Fields', value: '100+' }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-[#1e3a8a]/30 border border-blue-700/30 rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

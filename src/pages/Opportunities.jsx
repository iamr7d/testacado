import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  HiSearch,
  HiAcademicCap,
  HiCalendar,
  HiLocationMarker,
  HiStar,
  HiCurrencyDollar,
  HiLightningBolt,
  HiInformationCircle,
  HiExternalLink,
  HiMail,
  HiChartBar,
  HiGlobe,
  HiExclamation,
  HiX
} from 'react-icons/hi';
import Loading from '../components/Loading';
import Header from '../components/Header';
import { scrapePhdData } from '../services/phdService';
import LoadingStates from '../components/LoadingStates';
import OpportunityFilters from '../components/OpportunityFilters';
import ScoreBar from '../components/ScoreBar';

// Helper function to generate a unique ID
const generateId = (opportunity) => {
  const str = `${opportunity.title}-${opportunity.university}-${opportunity.link}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `opp_${Math.abs(hash)}`;
};

// Memoized Tooltip component
const Tooltip = memo(({ children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute z-50 w-64 p-3 mt-1 text-sm text-white bg-gray-900 rounded-xl shadow-lg 
    opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2 left-1/2">
      {children.props['data-tooltip']}
    </div>
  </div>
));

// Memoized OpportunityCard component
const OpportunityCard = memo(({ opportunity }) => {
  const {
    title,
    university,
    department,
    description,
    location,
    fundingStatus,
    supervisor,
    link,
    dates,
    scores
  } = opportunity;

  const handleAddToCalendar = () => {
    const event = {
      title: `Deadline: ${title}`,
      description: `PhD Opportunity at ${university}\n${description}`,
      location: location,
      startTime: dates?.deadline,
      endTime: dates?.deadline
    };
    
    window.dispatchEvent(new CustomEvent('addToCalendar', { detail: event }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="bg-[#1e1e3f]/50 backdrop-blur-sm p-4 rounded-2xl border border-blue-900/30 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex gap-6">
        {/* Left Section: Title and University */}
        <div className="w-1/4 min-w-[250px] border-r border-blue-900/30 pr-6">
          <h3 className="text-xl font-semibold text-blue-100 mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="space-y-1">
            <p className="text-blue-300">{university}</p>
            {department && (
              <p className="text-blue-400/70 text-sm">{department}</p>
            )}
          </div>
        </div>

        {/* Middle Section: Description and Tags */}
        <div className="flex-1">
          <p className="text-blue-200/80 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200">
                <i className="fas fa-map-marker-alt mr-1"></i>
                {location}
              </span>
            )}
            {fundingStatus && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                fundingStatus.toLowerCase().includes('fully') 
                  ? 'bg-green-900/30 text-green-200'
                  : fundingStatus.toLowerCase().includes('partial')
                  ? 'bg-yellow-900/30 text-yellow-200'
                  : 'bg-red-900/30 text-red-200'
              }`}>
                <i className="fas fa-coins mr-1"></i>
                {fundingStatus}
              </span>
            )}
            {dates?.deadline && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-200">
                <i className="fas fa-clock mr-1"></i>
                {new Date(dates.deadline).toLocaleDateString()}
              </span>
            )}
            {supervisor && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/30 text-indigo-200">
                <i className="fas fa-user-tie mr-1"></i>
                {supervisor}
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Scores and Actions */}
        <div className="w-1/4 min-w-[200px] border-l border-blue-900/30 pl-6">
          {scores && (
            <div className="space-y-2">
              {Object.entries(scores).map(([key, value]) => (
                key !== 'overall' && (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-300">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-blue-200">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          value >= 80 ? 'bg-green-500' :
                          value >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4 justify-end">
            {dates?.deadline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCalendar}
                className="p-2 rounded-xl bg-purple-900/30 text-purple-200 hover:bg-purple-800/40 transition-colors"
                title="Add to Calendar"
              >
                <i className="fas fa-calendar-plus"></i>
              </motion.button>
            )}
            {link && (
              <motion.a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-blue-900/30 text-blue-200 hover:bg-blue-800/40 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View Details"
              >
                <i className="fas fa-external-link-alt"></i>
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const LoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
  >
    {[...Array(6)].map((_, index) => (
      <motion.div
        key={`skeleton_${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: [0.4, 0.7, 0.4],
          y: 0 
        }}
        transition={{
          opacity: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          },
          y: {
            duration: 0.3,
            delay: index * 0.1
          }
        }}
        className="bg-[#1e1e3f]/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-900/30"
      >
        {/* Title Skeleton */}
        <div className="h-6 bg-blue-700/20 rounded-lg mb-4 w-3/4"></div>
        
        {/* University Skeleton */}
        <div className="h-4 bg-blue-700/20 rounded-lg mb-3 w-1/2"></div>
        
        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-blue-700/20 rounded-lg w-full"></div>
          <div className="h-3 bg-blue-700/20 rounded-lg w-5/6"></div>
          <div className="h-3 bg-blue-700/20 rounded-lg w-4/6"></div>
        </div>
        
        {/* Tags Skeleton */}
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-blue-700/20 rounded-full w-20"></div>
          <div className="h-6 bg-blue-700/20 rounded-full w-24"></div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// Main Opportunities Component
const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const searchTimeoutRef = useRef(null);

  // Fetch opportunities with search
  const fetchOpportunities = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await scrapePhdData(searchTerm);
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      setOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError(error.message || 'Failed to fetch opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      fetchOpportunities(value);
    }, 500);
  }, [fetchOpportunities]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    fetchOpportunities('');
  }, [fetchOpportunities]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Apply filters
    switch (activeFilter) {
      case 'funded':
        filtered = filtered.filter(opp => 
          opp.fundingStatus?.toLowerCase().includes('fully funded'));
        break;
      case 'international':
        filtered = filtered.filter(opp => 
          opp.description?.toLowerCase().includes('international') ||
          opp.location?.toLowerCase().includes('international'));
        break;
      case 'upcoming':
        filtered = filtered.filter(opp => {
          if (!opp.dates?.deadline) return false;
          const deadline = new Date(opp.dates.deadline);
          const now = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(now.getDate() + 30);
          return deadline > now && deadline <= thirtyDaysFromNow;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [opportunities, activeFilter]);

  return (
    <div className="min-h-screen bg-[#1e1e3f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-white">PhD Opportunities</h1>
            <span className="text-blue-300">
              {filteredOpportunities.length} opportunities found
            </span>
          </div>
        </div>

        {/* Filters */}
        <OpportunityFilters 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          totalCount={filteredOpportunities.length}
        />

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-blue-300/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for opportunities..."
            className="w-full bg-[#1e3a8a]/10 backdrop-blur-sm border border-blue-700/20 rounded-xl pl-12 pr-24 py-3 text-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            disabled={loading}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-4 flex items-center text-blue-300/50 hover:text-blue-300 transition-colors"
            >
              <HiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <HiExclamation className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-red-300 mb-2">
                Error Loading Opportunities
              </h3>
              <p className="text-blue-300">{error}</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-400 mb-4">
                <HiSearch className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-blue-300 mb-2">
                No Opportunities Found
              </h3>
              <p className="text-blue-300">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {filteredOpportunities.map((opportunity, index) => (
                <OpportunityCard 
                  key={opportunity.id || index} 
                  opportunity={opportunity} 
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Opportunities;

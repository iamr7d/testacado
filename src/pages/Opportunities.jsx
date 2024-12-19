import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  HiX,
  HiSparkles,
  HiChevronDown
} from 'react-icons/hi';
import Loading from '../components/Loading';
import Header from '../components/Header';
import { scrapePhdData, generateId } from '../services/phdService';
import LoadingStates from '../components/LoadingStates';
import OpportunityFilters from '../components/OpportunityFilters';
import ScoreBar from '../components/ScoreBar';

// Memoized Tooltip component
const Tooltip = memo(({ children, content }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-sm text-blue-300/90 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
      {content}
    </div>
  </div>
));

// Format score for display
const formatScore = (value) => {
  if (!value && value !== 0) return 'N/A';
  return Math.round(value);
};

// Memoized OpportunityCard component
const OpportunityCard = memo(({ opportunity }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
      <div className="relative bg-[#1e1e3f]/90 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-blue-400/30 transition-all duration-300 shadow-xl">
        {/* Header with Title and Match Score */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
              {opportunity.title}
            </h3>
            {opportunity.fundingStatus && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 mt-2">
                {opportunity.fundingStatus}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-xl">
              <span className="text-2xl font-bold text-blue-300">{opportunity.score || 0}</span>
              <span className="text-sm text-blue-300/70">Match</span>
            </div>
            {opportunity.dates?.deadline && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-300/60">
                <HiCalendar className="h-4 w-4" />
                <span>Deadline: {opportunity.dates.deadline}</span>
              </div>
            )}
          </div>
        </div>

        {/* University and Department */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <HiAcademicCap className="h-5 w-5 text-blue-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-blue-300">{opportunity.university}</span>
              <span className="text-xs text-blue-300/60">University</span>
            </div>
          </div>
          {opportunity.department && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <HiLightningBolt className="h-5 w-5 text-purple-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-purple-300">{opportunity.department}</span>
                <span className="text-xs text-purple-300/60">Department</span>
              </div>
            </div>
          )}
          {opportunity.location && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <HiLocationMarker className="h-5 w-5 text-green-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-green-300">{opportunity.location}</span>
                <span className="text-xs text-green-300/60">Location</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-4">
          <p className={`text-blue-300/70 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {opportunity.description}
          </p>
          {opportunity.description?.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 text-sm mt-1 hover:text-blue-300 flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <HiChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-white/5 rounded-xl">
          <Tooltip content="Research Alignment">
            <div className="flex flex-col items-center gap-1 p-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <HiLightningBolt className="h-5 w-5 text-blue-300" />
              </div>
              <span className="text-lg font-semibold text-blue-300">{opportunity.relevance || 0}%</span>
              <span className="text-xs text-blue-300/60">Research</span>
            </div>
          </Tooltip>
          <Tooltip content="Funding Status">
            <div className="flex flex-col items-center gap-1 p-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <HiCurrencyDollar className="h-5 w-5 text-green-300" />
              </div>
              <span className="text-lg font-semibold text-green-300">{opportunity.funding || 0}%</span>
              <span className="text-xs text-green-300/60">Funding</span>
            </div>
          </Tooltip>
          <Tooltip content="University Ranking">
            <div className="flex flex-col items-center gap-1 p-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <HiAcademicCap className="h-5 w-5 text-purple-300" />
              </div>
              <span className="text-lg font-semibold text-purple-300">{opportunity.university || 0}%</span>
              <span className="text-xs text-purple-300/60">University</span>
            </div>
          </Tooltip>
          <Tooltip content="Location Match">
            <div className="flex flex-col items-center gap-1 p-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <HiLocationMarker className="h-5 w-5 text-yellow-300" />
              </div>
              <span className="text-lg font-semibold text-yellow-300">{opportunity.location || 0}%</span>
              <span className="text-xs text-yellow-300/60">Location</span>
            </div>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.open(opportunity.link, '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-300 rounded-xl transition-all duration-300 flex-1"
          >
            <HiExternalLink className="h-5 w-5" />
            <span>View Details</span>
          </button>
          <button
            onClick={() => navigate(`/email-generator/${opportunity.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 text-purple-300 rounded-xl transition-all duration-300 flex-1"
          >
            <HiMail className="h-5 w-5" />
            <span>Generate Email</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 animate-pulse"
      >
        <div className="h-6 bg-blue-300/20 rounded w-3/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-4 bg-blue-300/20 rounded w-2/3"></div>
          <div className="h-4 bg-blue-300/20 rounded w-1/2"></div>
        </div>
        <div className="h-16 bg-blue-300/20 rounded mb-4"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-blue-300/20 rounded w-24"></div>
          <div className="h-8 bg-blue-300/20 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// Main Opportunities Component
const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    fullyFunded: false,
    international: false,
    upcoming: false
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() && !Object.values(filters).some(v => v)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get user profile from localStorage
      const userProfileStr = localStorage.getItem('userProfile');
      let userProfile = null;
      
      try {
        userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;
      } catch (e) {
        console.warn('Failed to parse user profile:', e);
      }
      
      const data = await scrapePhdData(searchQuery, filters, userProfile);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      
      setOpportunities(data);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to fetch opportunities. Please try again later.');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f2d]">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <HiSparkles className="h-8 w-8 text-blue-400" />
              PhD Opportunities
            </h1>
            <p className="text-xl text-blue-300/70 max-w-2xl mx-auto">
              Discover and apply to PhD positions that match your research interests and qualifications
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by keywords, university, or research area..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <HiSearch className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3 mt-4">
              <FilterPill
                active={filters.fullyFunded}
                onClick={() => handleFilterChange('fullyFunded')}
                icon={<HiCurrencyDollar className="h-5 w-5" />}
                label="Fully Funded"
              />
              <FilterPill
                active={filters.international}
                onClick={() => handleFilterChange('international')}
                icon={<HiGlobe className="h-5 w-5" />}
                label="International"
              />
              <FilterPill
                active={filters.upcoming}
                onClick={() => handleFilterChange('upcoming')}
                icon={<HiCalendar className="h-5 w-5" />}
                label="Upcoming Deadlines"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="flex items-center justify-center p-4 bg-red-500/10 rounded-xl">
            <HiExclamation className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12">
            <HiSearch className="h-12 w-12 text-blue-300/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-blue-300">No opportunities found</h3>
            <p className="text-blue-300/70 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterPill = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active
        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
        : 'bg-white/5 text-blue-300/70 border-white/10 hover:bg-white/10'
    } border`}
  >
    {icon}
    {label}
  </button>
);

const OpportunityCardSkeleton = () => (
  <div className="animate-pulse bg-white/5 rounded-2xl p-6">
    <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-white/10 rounded w-1/4 mb-6"></div>
    <div className="space-y-3">
      <div className="h-4 bg-white/10 rounded"></div>
      <div className="h-4 bg-white/10 rounded w-5/6"></div>
      <div className="h-4 bg-white/10 rounded w-4/6"></div>
    </div>
    <div className="grid grid-cols-4 gap-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-white/10 rounded"></div>
      ))}
    </div>
    <div className="flex gap-3 mt-6">
      <div className="h-10 bg-white/10 rounded flex-1"></div>
      <div className="h-10 bg-white/10 rounded flex-1"></div>
    </div>
  </div>
);

export default Opportunities;

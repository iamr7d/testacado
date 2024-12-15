import React, { useState, useEffect, useCallback, useMemo, memo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSearch,
  HiAcademicCap,
  HiCalendar,
  HiLocationMarker,
  HiStar,
  HiCurrencyDollar,
  HiLightningBolt,
  HiInformationCircle,
  HiExternalLink
} from 'react-icons/hi';
import Loading from '../components/Loading';

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
const OpportunityCard = memo(({
  id,
  title,
  university,
  location,
  description,
  deadline,
  stipend,
  keywords,
  rating,
  url
}) => {
  const handleViewDetails = useCallback(() => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group hover:transform hover:scale-[1.01]"
    >
      <div className="flex gap-6">
        {/* Left Column - Main Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{title}</h3>
              <div className="flex items-center gap-4">
                <p className="text-[#58CC02] font-semibold flex items-center gap-2">
                  <HiAcademicCap className="w-5 h-5" />
                  {university}
                </p>
                <div className="flex items-center text-white/60">
                  <HiLocationMarker className="w-5 h-5 mr-2" />
                  {location}
                </div>
              </div>
            </div>
            <div className="flex items-center bg-[#58CC02]/20 px-4 py-2 rounded-xl backdrop-blur-md">
              <HiStar className="w-6 h-6 text-[#58CC02] mr-2" />
              <span className="text-[#58CC02] font-bold text-lg">{rating?.overall || 'N/A'}</span>
            </div>
          </div>

          <p className="text-white/70 mb-4 line-clamp-2">{description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-white/80 bg-white/5 rounded-xl p-3">
              <HiCalendar className="w-5 h-5 mr-3 text-white/60" />
              <span className="truncate">{deadline}</span>
            </div>
            <div className="flex items-center text-white/80 bg-white/5 rounded-xl p-3">
              <HiCurrencyDollar className="w-5 h-5 mr-3 text-white/60" />
              <span className="truncate">{stipend}</span>
            </div>
          </div>

          {keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 4).map((keyword, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-white/5 text-white/80 rounded-xl text-sm cursor-pointer hover:bg-white/10 transition-all duration-200 backdrop-blur-md border border-white/10"
                  onClick={() => setSearchQuery(keyword)}
                >
                  {keyword}
                </span>
              ))}
              {keywords.length > 4 && (
                <span className="px-4 py-2 bg-white/5 text-white/80 rounded-xl text-sm">
                  +{keywords.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column - AI Analysis */}
        <div className="w-1/3 border-l border-white/10 pl-6">
          <div className="mb-4">
            <div className="flex items-center text-white mb-3">
              <HiLightningBolt className="w-5 h-5 mr-2 text-[#58CC02]" />
              <h4 className="font-semibold">AI Research Analysis</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-100 font-medium text-lg">Research Impact</span>
                  <div className="flex items-center gap-1">
                    {rating?.researchScore >= 85 ? (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <HiStar key={index} className="w-5 h-5 text-[#58CC02]" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="text-center mb-4">
                  <span className="text-[#58CC02] text-5xl font-bold">
                    {rating?.researchScore || '85'}
                  </span>
                  <span className="text-white/60 text-xl ml-1">/100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${rating?.researchScore || 85}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4">
                <h5 className="text-white/90 font-medium mb-2">Field Impact</h5>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {rating?.fieldImpact || 'This research contributes significantly to advancing knowledge in the field, with potential applications in both theoretical and practical domains.'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4">
                <h5 className="text-white/90 font-medium mb-2">Research Highlights</h5>
                <div className="space-y-2">
                  {(rating?.highlights || [
                    'Novel research methodology',
                    'Strong potential for innovation',
                    'High academic impact factor'
                  ]).map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#58CC02]" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-[#58CC02] to-[#46a302] text-white font-bold py-3 px-6 rounded-xl hover:from-[#46a302] hover:to-[#389102] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#58CC02]/20"
          >
            <span>View Details</span>
            <HiExternalLink className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in opportunities:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Opportunities Component
const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Memoized fetch function
  const fetchOpportunities = useCallback(async (keyword = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const enhancedData = data.map(opp => ({
        id: opp.id,
        title: opp.title || 'Untitled Position',
        university: opp.university || 'University Not Specified',
        deadline: opp.deadline || 'Deadline Not Specified',
        location: opp.location || 'Location Not Specified',
        description: opp.description || 'No description available',
        stipend: opp.funding || 'Funding details not available',
        rating: opp.rating || {},
        keywords: opp.keywords || [],
        url: opp.link || ''
      }));
      setOpportunities(enhancedData);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError(`Failed to fetch opportunities. ${error.message}`);
      setOpportunities([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Debounced search with cleanup
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        setSearching(true);
        fetchOpportunities(searchQuery);
      }
    }, 500); // Reduced from 1000ms to 500ms for better responsiveness

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchOpportunities]);

  // Sort opportunities by rating
  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => {
      const ratingA = a.rating?.researchScore || 0;
      const ratingB = b.rating?.researchScore || 0;
      return ratingB - ratingA; // Sort in descending order
    });
  }, [opportunities]);

  // Create opportunity cards with sorted data
  const opportunityCards = useMemo(() => {
    return sortedOpportunities.map((opportunity) => (
      <OpportunityCard
        key={opportunity.id}
        id={opportunity.id}
        title={opportunity.title}
        university={opportunity.university}
        location={opportunity.location}
        description={opportunity.description}
        deadline={opportunity.deadline}
        stipend={opportunity.stipend}
        keywords={opportunity.keywords}
        rating={opportunity.rating}
        url={opportunity.url}
      />
    ));
  }, [sortedOpportunities]);

  // Add a sort indicator in the UI
  const totalHighRated = useMemo(() => {
    return opportunities.filter(opp => (opp.rating?.researchScore || 0) >= 85).length;
  }, [opportunities]);

  if (loading && !searching) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#235390] to-[#2c4a7c] p-8">
        {/* Header Section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find Your Perfect PhD Opportunity
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover research opportunities from top universities worldwide
          </p>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="relative">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <HiSearch className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, university, location, or research area..."
                  className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#58CC02] focus:bg-white/20 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchOpportunities(searchQuery)}
                />
              </div>
              <button
                onClick={() => fetchOpportunities(searchQuery)}
                className="w-full sm:w-auto px-8 py-4 bg-[#58CC02] hover:bg-[#46a302] text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <HiSearch className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {searching && (
            <div className="flex justify-center items-center text-white/80 mt-6">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              <span>Searching opportunities...</span>
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Computer Science', 'Biology', 'Engineering', 'Medicine', 'Physics'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSearchQuery(filter);
                  fetchOpportunities(filter);
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-100 px-6 py-4 rounded-xl flex items-center gap-3">
                <HiInformationCircle className="w-6 h-6 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Sort Information */}
          {opportunities.length > 0 && (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-8">
              <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <HiStar className="w-5 h-5 text-[#58CC02]" />
                  <span className="text-white/90">
                    Showing {opportunities.length} opportunities
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">
                    {totalHighRated} highly rated
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <HiStar key={index} className="w-4 h-4 text-[#58CC02]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6">
              {opportunityCards}
            </div>
          </AnimatePresence>

          {opportunities.length === 0 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-white/5 backdrop-blur-xl rounded-3xl p-12 mt-8 border border-white/10"
            >
              <div className="bg-white/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <HiSearch className="w-10 h-10 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No matches found</h3>
              <p className="text-white/70 text-lg">Try adjusting your search terms or explore our quick filters above</p>
            </motion.div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { label: 'Universities', value: '500+' },
              { label: 'Countries', value: '50+' },
              { label: 'Opportunities', value: '1000+' },
              { label: 'Research Fields', value: '100+' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10"
              >
                <h4 className="text-3xl font-bold text-white mb-2">{stat.value}</h4>
                <p className="text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1a365d]/50 backdrop-blur-md py-8 border-t border-white/10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">
            Powered by AI • Updated daily • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </ErrorBoundary>
  );
};

export default Opportunities;

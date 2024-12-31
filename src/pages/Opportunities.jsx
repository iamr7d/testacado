import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityCardSkeleton from '../components/OpportunityCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiExclamation, HiSparkles, HiCurrencyDollar, HiGlobe, HiCalendar, HiAcademicCap, HiFilter } from 'react-icons/hi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { scrapePhdData } from '../services/phdService';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedOpportunities, setSavedOpportunities] = useState(() => {
    const saved = localStorage.getItem('savedOpportunities');
    return saved ? JSON.parse(saved) : [];
  });
  const [filters, setFilters] = useState({
    fullyFunded: false,
    international: false,
    hasDeadline: false,
    hasSupervisor: false,
    subjects: []
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortedScores, setSortedScores] = useState(new Map());

  // Application status options
  const statusOptions = [
    'Noted',
    'Started Applying',
    'Applied',
    'Shortlisted',
    'Rejected',
    'Interview',
    'Placed'
  ];

  // Sort dropdown options
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'compatibility', label: 'Best Match' }
  ];

  useEffect(() => {
    // Save opportunities to localStorage whenever they change
    localStorage.setItem('savedOpportunities', JSON.stringify(savedOpportunities));
  }, [savedOpportunities]);

  useEffect(() => {
    const calculateScores = async () => {
      if (!opportunities.length) return;
      
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (!userProfile.sop) return;

      const scores = new Map();
      for (const opp of opportunities) {
        // Use existing score if available, otherwise generate a stable random score
        if (!scores.has(opp.id)) {
          const hash = hashCode(opp.id); // Generate a stable hash from opportunity ID
          const randomScore = 32 + (hash % (92 - 32)); // Use hash to generate a stable score between 32-91
          scores.set(opp.id, randomScore);
        }
      }
      setSortedScores(scores);
    };

    calculateScores();
  }, [opportunities]);

  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Sort and filter opportunities
  const getSortedAndFilteredOpportunities = () => {
    let filtered = [...opportunities];

    // Apply filters
    if (filters.fullyFunded) {
      filtered = filtered.filter(opp => opp.fullyFunded);
    }
    if (filters.international) {
      filtered = filtered.filter(opp => opp.international);
    }
    if (filters.hasDeadline) {
      filtered = filtered.filter(opp => opp.deadline && opp.deadline !== 'Deadline Not Specified');
    }
    if (filters.hasSupervisor) {
      filtered = filtered.filter(opp => opp.supervisor);
    }

    // Sort opportunities
    filtered.sort((a, b) => {
      if (sortBy === 'compatibility') {
        // Get compatibility scores from our cached scores
        const scoreA = sortedScores.get(a.id) || 32;
        const scoreB = sortedScores.get(b.id) || 32;
        return scoreB - scoreA; // Sort in descending order
      } else {
        // Sort by date (default)
        const dateA = new Date(a.postedDate || a.deadline || 0);
        const dateB = new Date(b.postedDate || b.deadline || 0);
        return dateB - dateA;
      }
    });

    return filtered;
  };

  // Get sorted and filtered opportunities
  const filteredOpportunities = getSortedAndFilteredOpportunities();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await scrapePhdData(searchQuery, filters);
      setOpportunities(results);
      
      if (results.length === 0) {
        toast.info('No opportunities found. Try different search terms or filters.');
      } else {
        toast.success(`Found ${results.length} opportunities`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch opportunities. Please try again.');
      toast.error('Error fetching opportunities');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterName) => {
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

  const handleSaveOpportunity = (opportunity) => {
    const isAlreadySaved = savedOpportunities.some(saved => saved.id === opportunity.id);
    
    if (isAlreadySaved) {
      setSavedOpportunities(savedOpportunities.filter(saved => saved.id !== opportunity.id));
      toast.success('Opportunity removed from saved items');
    } else {
      const opportunityWithStatus = {
        ...opportunity,
        status: 'Noted',
        savedAt: new Date().toISOString()
      };
      setSavedOpportunities([...savedOpportunities, opportunityWithStatus]);
      toast.success('Opportunity saved successfully');
    }
  };

  const handleStatusChange = (opportunityId, newStatus) => {
    setSavedOpportunities(savedOpportunities.map(opp => 
      opp.id === opportunityId 
        ? { ...opp, status: newStatus, lastUpdated: new Date().toISOString() }
        : opp
    ));
    toast.success(`Status updated to ${newStatus}`);
  };

  // Check for upcoming deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      savedOpportunities.forEach(opp => {
        if (opp.deadline && opp.deadline !== 'Deadline Not Specified') {
          try {
            const deadline = new Date(opp.deadline);
            if (!isNaN(deadline.getTime())) {
              const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
              
              if (daysUntilDeadline === 7 || daysUntilDeadline === 3 || daysUntilDeadline === 1) {
                toast.warning(`Deadline approaching for ${opp.title} in ${daysUntilDeadline} days!`);
              }
            }
          } catch (error) {
            console.warn('Invalid deadline format:', opp.deadline);
          }
        }
      });
    };

    // Check deadlines on component mount and when saved opportunities change
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 24 * 60 * 60 * 1000); // Check daily
    
    return () => clearInterval(interval);
  }, [savedOpportunities]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search for PhD opportunities..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <HiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-8">
                <FilterPill
                  active={filters.fullyFunded}
                  onClick={() => toggleFilter('fullyFunded')}
                  icon={<HiCurrencyDollar />}
                  label="Fully Funded"
                />
                <FilterPill
                  active={filters.international}
                  onClick={() => toggleFilter('international')}
                  icon={<HiGlobe />}
                  label="International"
                />
                <FilterPill
                  active={filters.hasDeadline}
                  onClick={() => toggleFilter('hasDeadline')}
                  icon={<HiCalendar />}
                  label="Has Deadline"
                />
                <FilterPill
                  active={filters.hasSupervisor}
                  onClick={() => toggleFilter('hasSupervisor')}
                  icon={<HiAcademicCap />}
                  label="Has Supervisor"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-gray-400">Sort by:</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="sync">
                  {loading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, index) => (
                      <OpportunityCardSkeleton key={index} />
                    ))
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onSave={() => handleSaveOpportunity(opportunity)}
                        saved={savedOpportunities.some(saved => saved.id === opportunity.id)}
                        currentStatus={savedOpportunities.find(saved => saved.id === opportunity.id)?.status}
                        statusOptions={statusOptions}
                        onStatusChange={(newStatus) => handleStatusChange(opportunity.id, newStatus)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <HiExclamation className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-400">No opportunities found matching your criteria.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPill = ({ active, onClick, icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300
      ${active 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-white/5 text-blue-300 hover:bg-white/10 border border-white/10'}
    `}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

export default Opportunities;

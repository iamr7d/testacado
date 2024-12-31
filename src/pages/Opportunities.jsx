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
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const data = await scrapePhdData('', filters);
        setOpportunities(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
        toast.error('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [filters]);

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
            {/* Search and filters section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for PhD opportunities..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a3a] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500/50" size={20} />
                </div>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={filters.fullyFunded}
                  onClick={() => toggleFilter('fullyFunded')}
                  icon={HiCurrencyDollar}
                  label="Fully Funded"
                />
                <FilterPill
                  active={filters.international}
                  onClick={() => toggleFilter('international')}
                  icon={HiGlobe}
                  label="International"
                />
                <FilterPill
                  active={filters.hasDeadline}
                  onClick={() => toggleFilter('hasDeadline')}
                  icon={HiCalendar}
                  label="Has Deadline"
                />
                <FilterPill
                  active={filters.hasSupervisor}
                  onClick={() => toggleFilter('hasSupervisor')}
                  icon={HiAcademicCap}
                  label="Has Supervisor"
                />
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid gap-6 md:grid-cols-1">
                {[1, 2, 3].map((n) => (
                  <OpportunityCardSkeleton key={n} />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HiExclamation className="text-red-500 w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No results state */}
            {!loading && !error && opportunities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HiSearch className="text-blue-500/50 w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && opportunities.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 md:grid-cols-1"
              >
                <AnimatePresence>
                  {getSortedAndFilteredOpportunities().map((opportunity) => (
                    <motion.div key={opportunity.id} variants={itemVariants}>
                      <OpportunityCard
                        opportunity={opportunity}
                        onSave={() => handleSaveOpportunity(opportunity)}
                        saved={savedOpportunities.some(saved => saved.id === opportunity.id)}
                        statusOptions={statusOptions}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
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

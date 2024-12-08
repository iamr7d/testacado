import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { scrapePhdData } from '../services/phdService';
import Loading from '../components/Loading';
import { BsSearch } from 'react-icons/bs';

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await scrapePhdData(searchTerm || 'phd');
      setOpportunities(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch opportunities. Please try again later.');
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const categories = [
    { id: 'all', name: 'All Positions' },
    { id: 'phd', name: 'PhD Programs' },
    { id: 'masters', name: 'Masters Programs' },
    { id: 'research', name: 'Research Positions' },
    { id: 'postdoc', name: 'Postdoctoral' },
    { id: 'internship', name: 'Internships' },
    { id: 'job', name: 'Academic Jobs' }
  ];

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = !searchTerm || 
      opportunity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.university?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      opportunity.positionType === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-red-600 mt-8">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Research Opportunities</h1>
        
        <form onSubmit={handleSearch} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700"
            >
              <BsSearch size={20} />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredOpportunities.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          <p className="text-lg">No opportunities found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {opportunity.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={opportunity.imageUrl}
                    alt={opportunity.university}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {categories.find(cat => cat.id === opportunity.positionType)?.name || 'Research Position'}
                  </span>
                  {opportunity.deadline && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      Deadline: {opportunity.deadline}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {opportunity.shortDescription || opportunity.description?.slice(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.university && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {opportunity.university}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {opportunity.supervisor && `Supervisor: ${opportunity.supervisor}`}
                  </span>
                  <a
                    href={opportunity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Opportunities;

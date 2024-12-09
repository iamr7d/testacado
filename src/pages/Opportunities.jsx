import React, { useState, useEffect, useRef } from 'react';
import { scrapePhdData } from '../services/phdService';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const RatingDisplay = ({ rating }) => {
  const stars = Math.round(rating / 20); // Convert 0-100 to 0-5 stars
  return (
    <div className="flex items-center">
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="ml-2 text-sm font-medium text-gray-600">{rating}/100</span>
    </div>
  );
};

const SearchBar = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const searchTimeout = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 1000); // Wait 1 second after typing stops
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    onSearch(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search PhD opportunities (e.g. 'artificial intelligence', 'robotics', 'machine learning')"
          className="w-full px-4 py-3 pl-12 pr-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

const OpportunityCard = ({ opportunity, onFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    // Add to calendar
    const calendarEvent = {
      title: opportunity.title,
      start: new Date(opportunity.deadline),
      end: new Date(opportunity.deadline),
      type: 'deadline',
      description: `Deadline for ${opportunity.title} at ${opportunity.university}`,
      allDay: true,
    };
    
    // Save to localStorage
    const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    if (!isFavorite) {
      savedEvents.push(calendarEvent);
    } else {
      const index = savedEvents.findIndex(event => event.title === calendarEvent.title);
      if (index > -1) savedEvents.splice(index, 1);
    }
    localStorage.setItem('calendarEvents', JSON.stringify(savedEvents));
    
    // Trigger notification
    if (!isFavorite) {
      const deadlineDate = new Date(opportunity.deadline);
      const today = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
      
      if (Notification.permission === "granted") {
        new Notification("PhD Opportunity Reminder", {
          body: `Deadline for ${opportunity.title} is in ${daysUntilDeadline} days!`,
          icon: "/favicon.ico"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    
    onFavorite && onFavorite(calendarEvent);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <img 
          src={opportunity.logoUrl || "/default-university-logo.png"} 
          alt={opportunity.university} 
          className="w-16 h-16 object-contain"
        />
        <button
          onClick={handleFavoriteClick}
          className="text-2xl hover:scale-110 transition-transform duration-200"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-red-500" />
          )}
        </button>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{opportunity.title}</h3>
      <div className="text-sm text-gray-600 mb-2">{opportunity.university}</div>
      <div className="text-sm text-gray-600 mb-2">{opportunity.department}</div>
      
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, index) => (
          <span key={index} className={`text-xl ${
            index < Math.floor(opportunity.rating / 20) 
            ? 'text-yellow-400' 
            : 'text-gray-300'
          }`}>★</span>
        ))}
        <span className="ml-2 text-gray-600">{opportunity.rating}/100</span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Supervisor:</span>
          <span>{opportunity.supervisor}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Deadline:</span>
          <span className="text-red-600">{opportunity.deadline}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Funding:</span>
          <span>{opportunity.fundingStatus}</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{opportunity.description}</p>
      
      <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-200">
        View Details
      </button>
    </div>
  );
};

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchOpportunities = async (keyword = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await scrapePhdData(keyword);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setOpportunities(data);
      setFilteredOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError(error.message || 'Failed to fetch opportunities');
      setOpportunities([]);
      setFilteredOpportunities([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSearch = async (searchTerm) => {
    setSearchTerm(searchTerm);
    setIsSearching(true);
    await fetchOpportunities(searchTerm);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={() => {
            setError(null);
            fetchOpportunities();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />
      {isSearching && (
        <div className="mt-4 text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-600 mr-2"></div>
          Searching for opportunities...
        </div>
      )}
      {!isSearching && filteredOpportunities.length === 0 && searchTerm && (
        <p className="mt-4 text-center text-gray-600">
          No opportunities found matching '{searchTerm}'
        </p>
      )}
      {!isSearching && filteredOpportunities.length > 0 && searchTerm && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          Found {filteredOpportunities.length} opportunities matching '{searchTerm}'
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredOpportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </div>
  );
};

export default Opportunities;

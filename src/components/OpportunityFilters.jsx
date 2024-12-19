import React from 'react';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiCash, HiGlobe, HiCalendar, HiInformationCircle } from 'react-icons/hi';

const OpportunityFilters = ({ activeFilter, onFilterChange, totalCount = 0 }) => {
  const filters = [
    {
      id: 'all',
      label: 'All Opportunities',
      icon: HiAcademicCap,
      tooltip: 'View all available PhD opportunities'
    },
    {
      id: 'funded',
      label: 'Fully Funded',
      icon: HiCash,
      tooltip: 'Show only fully funded positions with stipend or scholarship'
    },
    {
      id: 'international',
      label: 'International',
      icon: HiGlobe,
      tooltip: 'Opportunities open to international students'
    },
    {
      id: 'upcoming',
      label: 'Upcoming Deadlines',
      icon: HiCalendar,
      tooltip: 'Positions with deadlines in the next 30 days'
    },
  ];

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeFilter === filter.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-[#1e3a8a]/10 text-blue-300/80 hover:bg-[#1e3a8a]/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              {React.createElement(filter.icon, {
                className: "w-5 h-5"
              })}
              <span>{filter.label}</span>
            </div>
            
            {/* Tooltip */}
            <div className="group relative">
              <HiInformationCircle className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-sm rounded-lg 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                {filter.tooltip}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            
            {activeFilter === filter.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Results count */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-blue-300/70 text-sm"
        >
          Found {totalCount} opportunities matching your criteria
        </motion.div>
      )}
    </div>
  );
};

export default OpportunityFilters;

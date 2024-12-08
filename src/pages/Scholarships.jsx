import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - replace with actual API calls
  const opportunities = [
    {
      id: 1,
      title: 'PhD Fellowship in Computer Science',
      description: 'Full funding for PhD students in Computer Science and related fields.',
      institution: 'MIT',
      deadline: '2024-12-31',
      amount: '$40,000/year',
      category: 'phd'
    },
    {
      id: 2,
      title: 'MSc Scholarship in Data Science',
      description: 'Full scholarship for Masters students in Data Science.',
      institution: 'Stanford University',
      deadline: '2024-11-30',
      amount: '$30,000/year',
      category: 'masters'
    },
    {
      id: 3,
      title: 'Summer Research Internship',
      description: 'Research internship opportunity in AI and Machine Learning.',
      institution: 'Google Research',
      deadline: '2024-03-15',
      amount: '$8,000/month',
      category: 'internship'
    },
    {
      id: 4,
      title: 'Research Grant in Robotics',
      description: 'Research funding for postdoctoral researchers in Robotics.',
      institution: 'NASA',
      deadline: '2024-10-30',
      amount: '$75,000/year',
      category: 'postdoc'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Opportunities' },
    { id: 'phd', name: 'PhD Programs' },
    { id: 'masters', name: 'Masters Programs' },
    { id: 'postdoc', name: 'Postdoc Positions' },
    { id: 'internship', name: 'Internships' }
  ];

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || opportunity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Opportunities</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search opportunities..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map(opportunity => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  opportunity.category === 'phd' ? 'bg-blue-100 text-blue-800' :
                  opportunity.category === 'masters' ? 'bg-purple-100 text-purple-800' :
                  opportunity.category === 'postdoc' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {opportunity.category.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
              <p className="text-gray-600 mb-4">{opportunity.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{opportunity.institution}</span>
                <span className="text-green-600 font-semibold">{opportunity.amount}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
                Apply Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Opportunities;

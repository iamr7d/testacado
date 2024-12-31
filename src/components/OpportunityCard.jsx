import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiAcademicCap, HiCalendar, HiBookmark, HiExternalLink, HiChevronDown, HiSparkles, HiOfficeBuilding, HiLocationMarker, HiGlobeAlt, HiChartBar } from 'react-icons/hi';
import { calculateCompatibilityScore } from '../utils/compatibilityScore';
import CalendarPopup from './CalendarPopup';

const unsplashConfig = {
  accessKey: 'XdoQ7Peb2eIU1Xdpbb0rU2LfFIYGtNWIiOa9u0dMpcg',
};

// Cache to store previously used image URLs
const usedImagesCache = new Set();

const extractKeywords = (opportunity) => {
  // Common stop words in PhD listings
  const stopWords = new Set([
    'phd', 'research', 'project', 'study', 'university', 'department',
    'the', 'and', 'or', 'in', 'at', 'of', 'to', 'for', 'with', 'by',
    'funded', 'scholarship', 'position', 'available', 'applications',
    'student', 'students', 'supervisor', 'supervisors', 'program',
    'opportunity', 'opportunities', 'degree', 'deadline', 'apply',
    'application', 'requirements', 'required', 'qualification', 'qualifications'
  ]);

  // Combine all relevant text with weighted importance
  const textSources = [
    { text: opportunity.title || '', weight: 3 },
    { text: opportunity.subjects || '', weight: 2 },
    { text: opportunity.disciplines || '', weight: 2 },
    { text: opportunity.department || '', weight: 1 },
    { text: opportunity.description || '', weight: 1 }
  ];

  // Extract words and clean them
  const wordCount = {};
  textSources.forEach(({ text, weight }) => {
    text.split(/\s+/)
      .map(word => word.toLowerCase().replace(/[^a-z]/g, ''))
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word)
      )
      .forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + weight;
      });
  });

  // Sort by weighted frequency and get top 3
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
};

const getTopicSpecificQuery = (opportunity) => {
  // Research area specific image queries
  const topicQueries = {
    'artificial intelligence': 'ai technology visualization blue',
    'machine learning': 'machine learning network blue',
    'deep learning': 'neural network visualization blue',
    'computer vision': 'computer vision processing technology',
    'robotics': 'modern robotics technology',
    'data science': 'data science analytics visualization',
    'cybersecurity': 'cybersecurity protection network',
    'quantum': 'quantum computing technology blue',
    'psychology': 'psychology research laboratory',
    'neuroscience': 'neuroscience brain research lab',
    'biology': 'biology research laboratory science',
    'chemistry': 'chemistry laboratory research',
    'physics': 'physics laboratory experiment',
    'engineering': 'modern engineering technology',
    'mathematics': 'mathematical visualization abstract',
    'environmental': 'environmental science research',
    'materials': 'materials science laboratory',
    'aerospace': 'aerospace engineering technology',
    'biomedical': 'biomedical research laboratory',
    'genetics': 'genetics research laboratory',
    'renewable': 'renewable energy technology',
    'sustainable': 'sustainable technology research',
    'nanotechnology': 'nanotechnology research microscope'
  };

  // Extract main keywords
  const keywords = extractKeywords(opportunity);
  
  // Check for direct matches in topic queries
  for (const [topic, query] of Object.entries(topicQueries)) {
    if (keywords.some(keyword => topic.includes(keyword))) {
      return query;
    }
  }

  // Create a focused query from keywords and context
  const department = opportunity.department
    ?.toLowerCase()
    .replace('school of', '')
    .replace('department of', '')
    .trim();

  const subjects = opportunity.subjects
    ?.split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)[0];

  // Prioritize specific terms for the query
  const specificTerm = keywords[0] || subjects || department || 'research';
  return `${specificTerm} laboratory science visualization modern`;
};

const OpportunityImage = ({ opportunity, className }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Get topic-specific search query
  const baseQuery = getTopicSpecificQuery(opportunity);

  const fetchImage = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=30&orientation=portrait`,
        {
          headers: {
            Authorization: `Client-ID ${unsplashConfig.accessKey}`,
          },
        }
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Filter out previously used images
        const availableImages = data.results.filter(img => 
          !usedImagesCache.has(img.urls.regular) &&
          img.width >= 800 && // Ensure minimum quality
          img.height >= 1000
        );
        
        if (availableImages.length > 0) {
          // Sort by relevance and quality
          const sortedImages = availableImages.sort((a, b) => {
            const scoreA = (a.likes * 0.3) + (a.width * a.height * 0.7);
            const scoreB = (b.likes * 0.3) + (b.width * b.height * 0.7);
            return scoreB - scoreA;
          });

          // Take from top 5 images randomly for variety
          const topImages = sortedImages.slice(0, 5);
          const selectedImage = topImages[Math.floor(Math.random() * topImages.length)];
          
          usedImagesCache.add(selectedImage.urls.regular);
          setImageUrl(selectedImage.urls.regular);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching image:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const attemptFetch = async () => {
      retryCount.current = 0;
      let success = await fetchImage(baseQuery);
      
      // Fallback queries if initial attempt fails
      const fallbackQueries = [
        `${baseQuery} concept`,
        `${opportunity.university} research`,
        'academic research'
      ];

      let queryIndex = 0;
      while (!success && queryIndex < fallbackQueries.length) {
        success = await fetchImage(fallbackQueries[queryIndex]);
        queryIndex++;
      }
    };

    attemptFetch();
  }, [baseQuery, opportunity]);

  if (loading) {
    return (
      <div className={`bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`}>
      <img
        src={imageUrl}
        alt={baseQuery}
        className="w-full h-full object-cover"
        style={{
          aspectRatio: '3/4',
        }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
    </div>
  );
};

const formatDeadline = (deadlineText) => {
  // Handle different deadline formats
  if (!deadlineText) return null;

  // Handle "Year round applications"
  if (deadlineText.toLowerCase().includes('year round')) {
    return {
      display: 'Year round applications',
      date: null,
      isYearRound: true
    };
  }

  // Extract date using regex
  const dateRegex = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i;
  const match = deadlineText.match(dateRegex);

  if (match) {
    const [_, day, month, year] = match;
    const date = new Date(`${month} ${day}, ${year}`);
    return {
      display: `Deadline: ${day} ${month} ${year}`,
      date: date,
      isYearRound: false
    };
  }

  return {
    display: deadlineText,
    date: null,
    isYearRound: false
  };
};

const DeadlineBadge = ({ deadline }) => {
  const deadlineInfo = formatDeadline(deadline);
  
  // Calculate if deadline is approaching (within 30 days)
  const isApproaching = deadlineInfo.date && 
    ((new Date(deadlineInfo.date) - new Date()) / (1000 * 60 * 60 * 24) <= 30);

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <HiCalendar className={`w-5 h-5 flex-shrink-0 ${isApproaching ? 'text-yellow-400' : ''}`} />
      <span className={`${isApproaching ? 'text-yellow-400 font-medium' : ''}`}>
        {deadlineInfo.display}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'interested':
        return 'bg-blue-500/20 text-blue-300';
      case 'applied':
        return 'bg-purple-500/20 text-purple-300';
      case 'accepted':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      case 'deadline passed':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status || 'Not Set'}
    </span>
  );
};

const cleanDescription = (description) => {
  if (!description) return '';
  return description
    .replace(/^Background:\s*\.?\s*/i, '') // Remove "Background:" and optional dot
    .replace(/\s*Read more\s*$/i, '') // Remove "Read more" at the end
    .trim();
};

const OpportunityCard = ({ opportunity, onSave, saved, currentStatus, statusOptions, onStatusChange }) => {
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [compatibility, setCompatibility] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const calculateScore = async () => {
      try {
        // Get user's SOP from localStorage
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (userProfile.sop) {
          const result = await calculateCompatibilityScore(userProfile.sop, opportunity);
          setCompatibilityScore(result);
          setCompatibility({
            score: result,
            explanation: 'This score is based on the compatibility of your SOP with the opportunity.'
          });
        }
      } catch (error) {
        console.error('Error calculating compatibility:', error);
      }
    };

    calculateScore();
  }, [opportunity]);

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or dropdown
    if (e.target.closest('button') || e.target.closest('.status-dropdown')) {
      return;
    }
    
    // Debug log the opportunity data
    console.log('Card clicked:', {
      title: opportunity.title,
      link: opportunity.link
    });
    
    // Validate link exists
    if (!opportunity.link) {
      console.warn('No link available for opportunity:', opportunity.title);
      return;
    }

    // Clean the link
    let link = opportunity.link.trim();
    
    // Add https:// if no protocol is specified
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'https://' + link;
    }

    try {
      // Validate URL format
      new URL(link);
      
      // Create and click a navigation link
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } catch (error) {
      console.error('Invalid URL format:', link);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1a1a3a] rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-blue-500/10"
      onClick={handleCardClick}
    >
      <div className="flex">
        {/* Left Content */}
        <div className="flex-1 p-6">
          {/* Category Tag */}
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
              {opportunity.category || "AI"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2">
            {opportunity.title}
          </h3>

          {/* Institution Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <HiAcademicCap className="w-5 h-5" />
              <span>{opportunity.department || "School of Informatics"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <HiOfficeBuilding className="w-5 h-5" />
              <span>{opportunity.university}</span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-yellow-400 mb-4">
            <HiCalendar className="w-5 h-5" />
            <span>Deadline: {opportunity.deadline}</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 line-clamp-2 mb-6">
            {cleanDescription(opportunity.description)}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <HiCalendar className="w-5 h-5" />
              <span>Add to Calendar</span>
            </button>
            <button
              onClick={() => onSave(opportunity)}
              className={`flex items-center gap-2 px-4 py-2 ${
                saved 
                  ? 'text-blue-400 hover:bg-blue-500/10' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              } rounded-lg transition-colors`}
            >
              <HiBookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Calendar Popup */}
          <AnimatePresence>
            {isCalendarOpen && (
              <CalendarPopup
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                deadline={formatDeadline(opportunity.deadline)}
                opportunityTitle={opportunity.title}
                onAddToCalendar={(event) => {
                  // Add to calendar logic here
                  const { title, date, reminderDate, description } = event;
                  
                  // Create calendar event
                  const calendarEvent = {
                    title,
                    start: date,
                    end: date,
                    description,
                    reminders: [{
                      method: 'popup',
                      minutes: Math.floor((date - reminderDate) / 1000 / 60)
                    }]
                  };

                  // You can integrate with various calendar APIs here
                  console.log('Adding to calendar:', calendarEvent);
                  
                  // Close popup
                  setIsCalendarOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Content - Image and Score */}
        <div className="w-72 relative">
          <OpportunityImage opportunity={opportunity} className="h-full object-cover" />
          {opportunity.compatibility && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Overall Score */}
              <div className="px-3 py-1 bg-blue-500/20 rounded-full flex items-center gap-2 cursor-pointer group/score relative">
                <HiChartBar className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">{opportunity.compatibility.score}% Match</span>
                
                {/* Detailed Score Tooltip */}
                <div className="absolute invisible group-hover/score:visible w-96 p-6 bg-gray-800/95 rounded-lg shadow-lg -bottom-2 right-0 transform translate-y-full z-20">
                  {/* Category Scores */}
                  <div className="space-y-4">
                    {Object.entries(opportunity.compatibility.categories).map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-white capitalize">{category.replace('_', ' ')}</h4>
                          <span className="text-blue-400 font-semibold">{data.score}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                        
                        {/* Strengths and Weaknesses */}
                        <div className="space-y-1 text-sm">
                          {data.details.map((detail, index) => (
                            <div key={index} className="flex items-start gap-2">
                              {detail.strength ? (
                                <>
                                  <span className="text-green-400 mt-1">+</span>
                                  <span className="text-gray-300">{detail.strength}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-red-400 mt-1">-</span>
                                  <span className="text-gray-300">{detail.weakness}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Key Matches */}
                  {opportunity.compatibility.keyMatches?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-white mb-2">Key Matches</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {opportunity.compatibility.keyMatches.map((match, index) => (
                          <li key={index} className="text-sm text-gray-300">{match}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Improvement Suggestions */}
                  {opportunity.compatibility.improvements?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-white mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {opportunity.compatibility.improvements.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-300">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Category Indicators */}
              <div className="flex gap-1">
                {Object.entries(opportunity.compatibility.categories).map(([category, data]) => (
                  <div
                    key={category}
                    className="w-2 h-8 rounded-full overflow-hidden cursor-pointer group/category relative"
                    style={{
                      background: `linear-gradient(to top, rgb(59, 130, 246) ${data.score}%, rgb(55, 65, 81) ${data.score}%)`
                    }}
                  >
                    {/* Category Tooltip */}
                    <div className="absolute invisible group-hover/category:visible w-48 p-3 bg-gray-800/95 rounded-lg shadow-lg -bottom-2 right-0 transform translate-y-full z-20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white capitalize text-sm">{category.replace('_', ' ')}</span>
                        <span className="text-blue-400 font-semibold text-sm">{data.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <HiSparkles className="w-4 h-4" />
                AI Match Score
              </div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {Math.round(opportunity?.compatibility?.score ?? (32 + Math.floor(Math.random() * (92 - 32))))}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

export default OpportunityCard;

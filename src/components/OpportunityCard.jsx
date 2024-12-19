import React, { useState } from 'react';
import { HiAcademicCap, HiLocationMarker, HiCurrencyDollar, HiCalendar, HiChevronDown, HiMail, HiExternalLink } from 'react-icons/hi';

const OpportunityCard = ({ opportunity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    title,
    university,
    department,
    description,
    score,
    fundingStatus = 'Funding status not specified',
  } = opportunity;

  const truncatedDescription = description?.length > 150 
    ? `${description.substring(0, 150)}...` 
    : description;

  return (
    <div className="bg-[#1a1a3a] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-500/10 hover:border-blue-500/30">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Content */}
        <div className="md:w-3/4 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
              <div className="flex items-center gap-3 text-sm text-blue-300/80 mb-3">
                <div className="flex items-center">
                  <HiAcademicCap className="w-4 h-4 mr-1" />
                  {university}
                </div>
                {department && (
                  <>
                    <span className="text-blue-500/50">•</span>
                    <div className="flex items-center">
                      <HiLocationMarker className="w-4 h-4 mr-1" />
                      {department}
                    </div>
                  </>
                )}
              </div>
            </div>
            {typeof score === 'number' && (
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {Math.round(score)}%
                  </div>
                  <div className="text-xs text-blue-300/70">Match</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                fundingStatus.toLowerCase().includes('fully funded')
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                <HiCurrencyDollar className="w-4 h-4 mr-1" />
                {fundingStatus}
              </span>
            </div>

            <p className="text-blue-300/70 text-sm">
              {isExpanded ? description : truncatedDescription}
              {description?.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="md:w-1/4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-t md:border-t-0 md:border-l border-blue-500/10 p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-2.5 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <HiMail className="w-5 h-5" />
              Generate Email
            </button>
            <button className="w-full bg-blue-500/10 text-blue-400 rounded-lg px-4 py-2.5 font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2">
              <HiExternalLink className="w-5 h-5" />
              View Details
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="bg-blue-500/5 rounded-lg p-3">
              <div className="text-lg font-semibold text-blue-400">0%</div>
              <div className="text-xs text-blue-300/70">Research</div>
            </div>
            <div className="bg-purple-500/5 rounded-lg p-3">
              <div className="text-lg font-semibold text-purple-400">0%</div>
              <div className="text-xs text-purple-300/70">Funding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;

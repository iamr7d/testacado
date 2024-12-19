import React from 'react';

const OpportunityCardSkeleton = () => {
  return (
    <div className="bg-[#1a1a3a] rounded-xl overflow-hidden border border-blue-500/10 animate-pulse">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Content */}
        <div className="md:w-3/4 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="h-7 bg-blue-500/10 rounded w-3/4 mb-2"></div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 bg-blue-500/10 rounded w-40"></div>
                <div className="h-5 bg-blue-500/10 rounded w-40"></div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-20 h-16 bg-blue-500/10 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 bg-blue-500/10 rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-4 bg-blue-500/10 rounded w-full"></div>
              <div className="h-4 bg-blue-500/10 rounded w-5/6"></div>
              <div className="h-4 bg-blue-500/10 rounded w-4/6"></div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="md:w-1/4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-t md:border-t-0 md:border-l border-blue-500/10 p-6">
          <div className="flex flex-col gap-4">
            <div className="h-10 bg-blue-500/10 rounded-lg"></div>
            <div className="h-10 bg-blue-500/10 rounded-lg"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-20 bg-blue-500/10 rounded-lg"></div>
            <div className="h-20 bg-blue-500/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCardSkeleton;

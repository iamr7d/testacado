import React from 'react';
import { HiLightningBolt } from 'react-icons/hi';

const Loading = ({ message = 'Loading...', progress }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="mb-4">
        <HiLightningBolt className="w-12 h-12 text-blue-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-blue-300 mb-2">{message}</h3>
      
      {progress && (
        <div className="w-64 bg-blue-900/30 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="text-sm text-blue-300/70 mt-4 text-center max-w-md">
        This might take a moment. We're searching through multiple sources to find the best opportunities for you.
      </div>
    </div>
  );
};

export default Loading;

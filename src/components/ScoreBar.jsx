import React from 'react';
import { motion } from 'framer-motion';

const ScoreBar = ({ score, label }) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-blue-300">{label}</span>
        <span className="text-sm text-blue-300">{normalizedScore}%</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor(normalizedScore)}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;

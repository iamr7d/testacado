import React from 'react';
import { motion } from 'framer-motion';

const LoadingCircle = () => (
  <motion.div
    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
    animate={{
      rotate: 360
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

const LoadingStates = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      <LoadingCircle />
      <p className="text-blue-300 text-sm font-medium">Analyzing opportunities...</p>
    </div>
  );
};

export default LoadingStates;

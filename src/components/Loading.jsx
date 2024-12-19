import React from 'react';
import { motion } from 'framer-motion';
import { HiLightningBolt } from 'react-icons/hi';

const Loading = ({ message = 'Loading...', progress }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-4"
      >
        <HiLightningBolt className="w-12 h-12 text-blue-400" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-blue-300 mb-2">{message}</h3>
      
      {progress && (
        <div className="w-64 bg-blue-900/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-sm text-blue-300/70 mt-4 text-center max-w-md"
      >
        This might take a moment. We're searching through multiple sources to find the best opportunities for you.
      </motion.div>
    </div>
  );
};

export default Loading;

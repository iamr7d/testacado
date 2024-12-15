import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiLightningBolt, HiSearch, HiAcademicCap } from 'react-icons/hi';

const Loading = () => {
  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    { text: 'Fetching opportunities...', icon: HiSearch },
    { text: 'Analyzing research potential...', icon: HiLightningBolt },
    { text: 'Processing results...', icon: HiAcademicCap }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] via-[#235390] to-[#2c4a7c] flex justify-center items-center">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 w-full max-w-lg border border-white/10">
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#58CC02]/20 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            {React.createElement(steps[loadingStep].icon, {
              className: "w-10 h-10 text-[#58CC02]"
            })}
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">
            {steps[loadingStep].text}
          </h2>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                  ${index <= loadingStep ? 'bg-[#58CC02]' : 'bg-white/20'}`}>
                  {React.createElement(step.icon, {
                    className: "w-4 h-4 text-white"
                  })}
                </div>
                <span className={`text-sm ${index <= loadingStep ? 'text-white' : 'text-white/60'}`}>
                  {step.text}
                </span>
              </div>
              {index < steps.length - 1 && (
                <motion.div
                  className="h-1 bg-white/10 rounded-full overflow-hidden ml-8 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {index < loadingStep && (
                    <motion.div
                      className="h-full bg-[#58CC02]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;

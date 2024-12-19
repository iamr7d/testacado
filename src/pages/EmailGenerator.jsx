import React, { useState } from 'react';
import { HiMail } from 'react-icons/hi';
import Header from '../components/Header';

const EmailGenerator = () => {
  return (
    <div className="min-h-screen bg-[#1e1e2f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <HiMail className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Email Generator</h1>
            <p className="text-blue-300">AI-powered email generation for PhD applications</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative mb-12">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
              <span className="mt-2 text-blue-300">Analyze Profile</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center text-blue-300 font-bold">2</div>
              <span className="mt-2 text-blue-300">Your Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center text-blue-300 font-bold">3</div>
              <span className="mt-2 text-blue-300">Generate Email</span>
            </div>
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#1e3a8a] -z-10"></div>
        </div>

        {/* Professor Profile Analysis Form */}
        <div className="bg-[#1e3a8a]/20 rounded-2xl p-8 backdrop-blur-lg border border-blue-700/30">
          <div className="flex items-center space-x-3 mb-6">
            <HiMail className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Professor Profile Analysis</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="profileUrl" className="block text-sm font-medium text-blue-300 mb-2">
                Professor's Profile URL
              </label>
              <input
                type="text"
                id="profileUrl"
                className="w-full bg-[#1e1e2f] border border-blue-700/30 rounded-xl py-3 px-4 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500/50"
                placeholder="Enter the URL of the professor's academic profile"
              />
            </div>
            
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl">
              <span>Analyze Profile</span>
              <HiMail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailGenerator;

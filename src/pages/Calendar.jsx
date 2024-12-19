import React, { useState } from 'react';
import { HiCalendar, HiClock, HiInformationCircle } from 'react-icons/hi';
import Header from '../components/Header';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const deadlines = [
    {
      title: 'Machine Learning PhD at MIT',
      date: '2025-01-15',
      time: '23:59 EST',
      type: 'Application Deadline'
    },
    {
      title: 'AI Research Position at Stanford',
      date: '2025-02-01',
      time: '17:00 PST',
      type: 'Early Decision'
    },
    {
      title: 'Computer Vision PhD at CMU',
      date: '2025-02-15',
      time: '23:59 EST',
      type: 'Regular Decision'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e3f]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Application Calendar</h1>
          <div className="text-blue-300">
            <span className="text-white font-semibold">{deadlines.length}</span> upcoming deadlines
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-2 bg-[#1e3a8a]/50 rounded-2xl p-6 border border-blue-700/30">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">December 2024</h2>
              {/* Calendar grid would go here */}
              <div className="text-center text-blue-200">
                Calendar component will be implemented here
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-[#1e3a8a]/50 rounded-2xl p-6 border border-blue-700/30">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {deadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="bg-blue-800/30 rounded-xl p-4 border border-blue-700/30"
                >
                  <h3 className="text-white font-medium mb-2">{deadline.title}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center text-blue-300">
                      <HiCalendar className="w-4 h-4 mr-1" />
                      {deadline.date}
                    </div>
                    <div className="flex items-center text-blue-300">
                      <HiClock className="w-4 h-4 mr-1" />
                      {deadline.time}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                      {deadline.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-[#1e3a8a]/50 rounded-2xl p-6 border border-blue-700/30">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <HiInformationCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Application Tips</h3>
              <p className="text-blue-200">
                Keep track of your application deadlines and set reminders at least a week before each deadline. 
                Make sure to prepare all required documents well in advance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

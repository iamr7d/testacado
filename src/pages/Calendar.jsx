import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import OpportunityCalendar from '../components/OpportunityCalendar';
import { HiCalendar, HiClock, HiAcademicCap, HiCheckCircle, HiChartBar, HiOutlineArrowSmRight, HiChevronDown, HiExternalLink } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Calendar = () => {
  const [savedOpportunities, setSavedOpportunities] = useState(() => {
    const saved = localStorage.getItem('savedOpportunities');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedStatus, setExpandedStatus] = useState(null);

  const statusOptions = [
    'Noted',
    'Started Applying',
    'Applied',
    'Shortlisted',
    'Rejected',
    'Interview',
    'Placed'
  ];

  const handleStatusChange = (opportunityId, newStatus) => {
    setSavedOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, status: newStatus, lastUpdated: new Date().toISOString() }
          : opp
      )
    );
  };

  const getStats = () => {
    return {
      total: savedOpportunities.length,
      upcoming: savedOpportunities.filter(opp => {
        if (!opp.deadline) return false;
        const deadline = new Date(opp.deadline);
        const now = new Date();
        const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        return daysUntil > 0;
      }).length,
      applied: savedOpportunities.filter(opp => opp.status === 'Applied').length,
      inProgress: savedOpportunities.filter(opp => 
        ['Shortlisted', 'Interview'].includes(opp.status)
      ).length,
      completed: savedOpportunities.filter(opp => 
        ['Placed', 'Rejected'].includes(opp.status)
      ).length
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      'Noted': 'from-blue-500/20 to-blue-400/20 text-blue-300 border-blue-500/30',
      'Started Applying': 'from-yellow-500/20 to-yellow-400/20 text-yellow-300 border-yellow-500/30',
      'Applied': 'from-purple-500/20 to-purple-400/20 text-purple-300 border-purple-500/30',
      'Shortlisted': 'from-green-500/20 to-green-400/20 text-green-300 border-green-500/30',
      'Rejected': 'from-red-500/20 to-red-400/20 text-red-300 border-red-500/30',
      'Interview': 'from-indigo-500/20 to-indigo-400/20 text-indigo-300 border-indigo-500/30',
      'Placed': 'from-emerald-500/20 to-emerald-400/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[status] || 'from-gray-500/20 to-gray-400/20 text-gray-300 border-gray-500/30';
  };

  const stats = getStats();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const groupedOpportunities = statusOptions.reduce((acc, status) => {
    acc[status] = savedOpportunities.filter(opp => opp.status === status);
    return acc;
  }, {});

  return (
    <>
      <motion.div 
        className="min-h-screen bg-[#0F1225] text-white"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#8BA4FF] mb-2">Application Calendar</h1>
            <p className="text-gray-400">Track your PhD application deadlines and progress</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: HiCalendar, color: '#8BA4FF', bg: '#1A1F3D', border: '#2A3366', title: 'Total Applications', value: stats.total },
              { icon: HiClock, color: '#FFB84C', bg: '#2A2620', border: '#3D3426', title: 'Applied', value: stats.applied },
              { icon: HiAcademicCap, color: '#B388FF', bg: '#271F3B', border: '#382D54', title: 'In Progress', value: stats.inProgress },
              { icon: HiCheckCircle, color: '#4CAF50', bg: '#1F3229', border: '#2D473B', title: 'Completed', value: stats.completed }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`bg-[${stat.bg}] p-6 rounded-2xl border border-[${stat.border}] hover:border-opacity-75 transition-all duration-300`}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-[${stat.border}]`}>
                    {React.createElement(stat.icon, { className: `h-6 w-6 text-[${stat.color}]` })}
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Deadline Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { icon: HiCalendar, label: 'upcoming deadlines', value: stats.upcoming },
              { icon: HiChartBar, label: 'completion', value: `${Math.round((stats.completed / stats.total) * 100)}%` }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-[#1A1F3D] p-4 rounded-2xl border border-[#2A3366] flex items-center gap-3 hover:border-opacity-75 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                {React.createElement(stat.icon, { className: "h-5 w-5 text-[#8BA4FF]" })}
                <span className="text-[#8BA4FF]">{stat.value} {stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Calendar Column */}
            <div className="col-span-12 lg:col-span-8">
              <motion.div 
                className="bg-[#1A1F3D] rounded-2xl border border-[#2A3366] p-6 h-[600px] overflow-hidden"
                variants={itemVariants}
              >
                <div className="flex flex-wrap gap-4 mb-6">
                  {[
                    { icon: HiCalendar, color: '#8BA4FF', label: 'Total', value: stats.total },
                    { icon: HiClock, color: '#FFB84C', label: 'Upcoming', value: stats.upcoming },
                    { icon: HiClock, color: '#FF6B6B', label: 'Due Soon', value: stats.dueSoon },
                    { icon: HiClock, color: '#FF4949', label: 'Overdue', value: stats.overdue }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="bg-[#2A3366] rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-[#323B6E] transition-colors"
                    >
                      {React.createElement(stat.icon, { className: `h-5 w-5 text-[${stat.color}]` })}
                      <span>{stat.label}: {stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-[calc(100%-4rem)] overflow-hidden">
                  <OpportunityCalendar
                    opportunities={savedOpportunities}
                    onStatusChange={handleStatusChange}
                    statusOptions={statusOptions}
                  />
                </div>
              </motion.div>
            </div>

            {/* Status Column */}
            <div className="col-span-12 lg:col-span-4">
              <motion.div 
                className="bg-[#1A1F3D] rounded-2xl border border-[#2A3366] h-[600px] overflow-hidden flex flex-col"
                variants={itemVariants}
              >
                <div className="p-4 border-b border-[#2A3366]">
                  <h2 className="text-xl font-semibold text-[#8BA4FF]">Applications by Status</h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {statusOptions.map(status => (
                    <motion.div
                      key={status}
                      variants={itemVariants}
                      className="bg-[#2A3366] rounded-xl overflow-hidden"
                    >
                      <motion.button
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#323B6E] transition-colors"
                        onClick={() => setExpandedStatus(expandedStatus === status ? null : status)}
                      >
                        <div className="flex items-center gap-3">
                          <span>{status}</span>
                          <span className="bg-[#1A1F3D] px-2 py-1 rounded-md text-sm">
                            {groupedOpportunities[status].length}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedStatus === status ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <HiChevronDown className="w-5 h-5" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedStatus === status && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 space-y-3">
                              {groupedOpportunities[status].length > 0 ? (
                                groupedOpportunities[status].map(opp => (
                                  <motion.div
                                    key={opp.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-[#1A1F3D] rounded-lg p-3 hover:bg-[#212644] transition-colors group"
                                  >
                                    <div className="flex flex-col gap-2">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <h4 className="font-medium mb-1 line-clamp-1">{opp.title}</h4>
                                          <p className="text-sm text-gray-400 line-clamp-1">{opp.university}</p>
                                        </div>
                                        {opp.link && (
                                          <a
                                            href={opp.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-[#2A3366] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                          >
                                            <HiExternalLink className="w-5 h-5" />
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-sm text-gray-400">
                                        {opp.deadline && (
                                          <div className="flex items-center gap-2">
                                            <HiCalendar className="w-4 h-4" />
                                            {new Date(opp.deadline).toLocaleDateString()}
                                          </div>
                                        )}
                                        <div className="text-xs">
                                          Updated: {new Date(opp.lastUpdated).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="text-center py-3 text-sm text-gray-400">
                                  No applications in this status
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 164, 255, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 164, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(139, 164, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Calendar;

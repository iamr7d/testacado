import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { HiChevronDown, HiCalendar, HiExclamationCircle, HiAcademicCap, HiClock, HiX, HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const calendarStyles = `
  .react-calendar {
    width: 100%;
    background: rgba(26, 26, 58, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 1rem;
    font-family: inherit;
    line-height: 1.125em;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
  }
  .react-calendar:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .react-calendar__navigation {
    height: auto;
    margin-bottom: 0;
    padding: 1rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1.1rem;
    font-weight: 600;
    padding: 1rem 0.5rem;
    color: #93c5fd;
    transition: all 0.2s ease;
    border-radius: 0.5rem;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: rgba(59, 130, 246, 0.2);
    color: #bfdbfe;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 1rem 0;
    color: #60a5fa;
    background: rgba(59, 130, 246, 0.05);
  }
  .react-calendar__month-view__days__day {
    padding: 1.2rem 0;
    color: #93c5fd;
    position: relative;
    z-index: 1;
  }
  .react-calendar__tile {
    position: relative;
    padding: 2rem 0.5rem;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #93c5fd;
    transition: all 0.2s ease;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: rgba(59, 130, 246, 0.15);
    border-radius: 0.75rem;
    color: #bfdbfe;
  }
  .react-calendar__tile--now {
    background: rgba(59, 130, 246, 0.15);
    border-radius: 0.75rem;
    font-weight: 600;
  }
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: rgba(59, 130, 246, 0.25);
  }
  .react-calendar__tile--active {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 0.75rem;
    color: white;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: rgba(59, 130, 246, 0.4);
  }
  .react-calendar__month-view__days__day--weekend {
    color: #f87171;
  }
  .deadline-indicator {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 3px;
  }
  .deadline-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  .deadline-dot.upcoming {
    background-color: #60a5fa;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
  }
  .deadline-dot.due-soon {
    background-color: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  }
  .deadline-dot.overdue {
    background-color: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  }
  .deadline-count {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 0.5rem;
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
    font-weight: 600;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
  }
  .deadline-count:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
  }
`;

const OpportunityCalendar = ({ opportunities = [], onStatusChange, statusOptions = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    dueSoon: 0,
    overdue: 0
  });

  useEffect(() => {
    calculateStats();
  }, [opportunities]);

  const calculateStats = () => {
    const now = new Date();
    const stats = opportunities.reduce((acc, opp) => {
      if (!opp.deadline) return acc;
      
      const deadline = new Date(opp.deadline);
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      acc.total++;
      if (daysUntil > 7) acc.upcoming++;
      else if (daysUntil > 0) acc.dueSoon++;
      else acc.overdue++;
      
      return acc;
    }, { total: 0, upcoming: 0, dueSoon: 0, overdue: 0 });
    
    setStats(stats);
  };

  const getOpportunitiesForDate = (date) => {
    return opportunities.filter(opp => {
      if (!opp.deadline) return false;
      const oppDeadline = new Date(opp.deadline);
      return (
        oppDeadline.getDate() === date.getDate() &&
        oppDeadline.getMonth() === date.getMonth() &&
        oppDeadline.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDayStatus = (date) => {
    const opps = getOpportunitiesForDate(date);
    if (opps.length === 0) return null;

    const now = new Date();
    const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return 'overdue';
    if (daysUntil <= 7) return 'due-soon';
    return 'upcoming';
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const opps = getOpportunitiesForDate(date);
    if (opps.length === 0) return null;

    const status = getDayStatus(date);
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {opps.length > 0 && (
          <span className="deadline-count">{opps.length}</span>
        )}
        <div className="deadline-indicator">
          <motion.div 
            className={`deadline-dot ${status}`}
            whileHover={{ scale: 1.2 }}
          />
        </div>
      </motion.div>
    );
  };

  const handleStatusChange = (oppId, newStatus) => {
    onStatusChange(oppId, newStatus);
    setShowStatusDropdown(null);
    toast.success(`Status updated to ${newStatus}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Noted': 'bg-blue-500/20 text-blue-300',
      'Started Applying': 'bg-yellow-500/20 text-yellow-300',
      'Applied': 'bg-purple-500/20 text-purple-300',
      'Shortlisted': 'bg-green-500/20 text-green-300',
      'Rejected': 'bg-red-500/20 text-red-300',
      'Interview': 'bg-indigo-500/20 text-indigo-300',
      'Placed': 'bg-emerald-500/20 text-emerald-300'
    };
    return colors[status] || 'bg-blue-500/20 text-blue-300';
  };

  return (
    <div className="space-y-6">
      <style>{calendarStyles}</style>
      
      {/* Stats Bar */}
      <motion.div 
        className="grid grid-cols-4 gap-4 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <HiCalendar className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Total</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.total}</div>
        </motion.div>

        <motion.div 
          className="bg-green-500/10 rounded-xl p-4 border border-green-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <HiSparkles className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">Upcoming</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.upcoming}</div>
        </motion.div>

        <motion.div 
          className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <HiClock className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">Due Soon</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.dueSoon}</div>
        </motion.div>

        <motion.div 
          className="bg-red-500/10 rounded-xl p-4 border border-red-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <HiExclamationCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-medium text-red-300">Overdue</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{stats.overdue}</div>
        </motion.div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          className="calendar-custom"
        />
      </motion.div>

      {/* Selected Date Opportunities */}
      <AnimatePresence>
        {selectedDate && getOpportunitiesForDate(selectedDate).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mt-6 space-y-4"
          >
            <h3 className="text-xl font-semibold text-blue-300">
              Deadlines for {selectedDate.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {getOpportunitiesForDate(selectedDate).map((opp) => (
                <motion.div
                  key={opp.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="bg-white/5 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-blue-300">{opp.title}</h4>
                      <p className="text-sm text-blue-300/70">{opp.university}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(opp.status)}`}>
                        {opp.status || 'No Status'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setSelectedOpportunity(opp)}
                      >
                        <HiChevronDown className="w-5 h-5 text-blue-300" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {selectedOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedOpportunity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-blue-300">Update Status</h3>
                <button
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <HiX className="w-5 h-5 text-blue-300" />
                </button>
              </div>
              <div className="space-y-3">
                {statusOptions.map(status => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleStatusChange(selectedOpportunity.id, status);
                      setSelectedOpportunity(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left ${getStatusColor(status)} hover:bg-white/5 transition-colors`}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpportunityCalendar;

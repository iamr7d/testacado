import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';

const Calendar = ({ deadlines = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const hasDeadline = (date) => {
    return deadlines.some(deadline => {
      const deadlineDate = new Date(deadline.deadline);
      return isSameDay(date, deadlineDate);
    });
  };

  const getDeadlinesForDate = (date) => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.deadline);
      return isSameDay(date, deadlineDate);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400 transition-colors"
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-purple-500/10 rounded-lg text-purple-400 transition-colors"
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-purple-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {monthDays.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasEvent = hasDeadline(day);
          
          return (
            <motion.button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-10 rounded-lg text-sm font-medium
                ${!isSameMonth(day, currentDate) ? 'text-gray-600' : ''}
                ${isToday ? 'text-purple-400 ring-1 ring-purple-400/50' : 'text-gray-400'}
                ${isSelected ? 'bg-purple-500/20 text-white' : 'hover:bg-purple-500/10'}
                ${hasEvent ? 'font-bold' : ''}
                transition-all duration-200
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {format(day, 'd')}
              {hasEvent && (
                <motion.div
                  layoutId="event-indicator"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Deadlines Display */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 space-y-2"
          >
            <h3 className="text-sm font-medium text-purple-400">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {getDeadlinesForDate(selectedDate).map((deadline, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-purple-500/10 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <HiCalendar className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{deadline.title}</p>
                    <p className="text-sm text-gray-400">{deadline.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {getDeadlinesForDate(selectedDate).length === 0 && (
              <p className="text-gray-400 text-sm">No deadlines for this date</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;

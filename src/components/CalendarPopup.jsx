import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCalendar, HiX, HiCheck, HiOutlineBell } from 'react-icons/hi';

const CalendarPopup = ({ isOpen, onClose, deadline, opportunityTitle, onAddToCalendar }) => {
  const [reminderDays, setReminderDays] = useState(7);
  const [customDate, setCustomDate] = useState('');
  const [selectedOption, setSelectedOption] = useState('deadline');

  useEffect(() => {
    if (deadline?.date) {
      setCustomDate(new Date(deadline.date).toISOString().split('T')[0]);
    }
  }, [deadline]);

  const handleSubmit = () => {
    const eventDate = selectedOption === 'deadline' ? deadline.date : new Date(customDate);
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    onAddToCalendar({
      title: `PhD Deadline: ${opportunityTitle}`,
      date: eventDate,
      reminderDate,
      description: `Deadline for PhD application: ${opportunityTitle}`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <HiCalendar className="w-6 h-6 text-blue-400" />
            Add to Calendar
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <HiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Event Date</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  name="dateOption"
                  value="deadline"
                  checked={selectedOption === 'deadline'}
                  onChange={e => setSelectedOption(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span>Use deadline date ({deadline?.display})</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  name="dateOption"
                  value="custom"
                  checked={selectedOption === 'custom'}
                  onChange={e => setSelectedOption(e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span>Choose custom date</span>
              </label>
            </div>
          </div>

          {selectedOption === 'custom' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Custom Date</label>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Reminder Settings */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
              <HiOutlineBell className="w-5 h-5 text-yellow-400" />
              Reminder
            </label>
            <select
              value={reminderDays}
              onChange={e => setReminderDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 day before</option>
              <option value={3}>3 days before</option>
              <option value={7}>1 week before</option>
              <option value={14}>2 weeks before</option>
              <option value={30}>1 month before</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <HiCheck className="w-5 h-5" />
            Add to Calendar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarPopup;

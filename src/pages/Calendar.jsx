import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { BsChevronLeft, BsChevronRight, BsPlus, BsCheck2, BsX, BsCalendar2Check } from 'react-icons/bs';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: new Date() });
  const [newHabit, setNewHabit] = useState({ title: '', description: '', frequency: 'daily', streak: 0 });
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', startDate: new Date(), progress: 0 });

  useEffect(() => {
    // Load data from localStorage
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const savedHabits = JSON.parse(localStorage.getItem('habits') || '[]');
    const savedChallenges = JSON.parse(localStorage.getItem('challenges') || '[]');
    setEvents(savedEvents);
    setHabits(savedHabits);
    setChallenges(savedChallenges);
  }, []);

  useEffect(() => {
    // Save data to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('challenges', JSON.stringify(challenges));
  }, [events, habits, challenges]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddEvent = (e) => {
    e.preventDefault();
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', description: '', date: new Date() });
    setShowEventModal(false);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    setHabits([...habits, { ...newHabit, id: Date.now(), completedDates: [] }]);
    setNewHabit({ title: '', description: '', frequency: 'daily', streak: 0 });
    setShowHabitModal(false);
  };

  const handleAddChallenge = (e) => {
    e.preventDefault();
    setChallenges([...challenges, { ...newChallenge, id: Date.now(), days: Array(21).fill(false) }]);
    setNewChallenge({ title: '', description: '', startDate: new Date(), progress: 0 });
    setShowChallengeModal(false);
  };

  const toggleHabitCompletion = (habitId, date) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completedDates = habit.completedDates || [];
        const isCompleted = completedDates.includes(dateStr);
        
        return {
          ...habit,
          completedDates: isCompleted
            ? completedDates.filter(d => d !== dateStr)
            : [...completedDates, dateStr],
          streak: isCompleted ? habit.streak - 1 : habit.streak + 1
        };
      }
      return habit;
    }));
  };

  const toggleChallengeDay = (challengeId, dayIndex) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const newDays = [...challenge.days];
        newDays[dayIndex] = !newDays[dayIndex];
        const progress = (newDays.filter(day => day).length / 21) * 100;
        return { ...challenge, days: newDays, progress };
      }
      return challenge;
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <BsChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <BsChevronRight size={20} />
              </button>
              <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <BsPlus size={20} className="mr-1" />
                Add Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day, index) => {
              const dayEvents = events.filter(event => 
                format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              );
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer
                    ${isToday(day) ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'}
                    ${isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'}
                    ${format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  <div className="font-medium mb-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-green-100 rounded truncate"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits and Challenges Section */}
        <div className="space-y-6">
          {/* Habits Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Habits</h3>
              <button
                onClick={() => setShowHabitModal(true)}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <BsPlus size={20} className="mr-1" />
                New Habit
              </button>
            </div>
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{habit.title}</h4>
                    <span className="text-sm text-gray-600">
                      Streak: {habit.streak} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                  <button
                    onClick={() => toggleHabitCompletion(habit.id, new Date())}
                    className={`w-full py-2 rounded-lg flex items-center justify-center ${
                      (habit.completedDates || []).includes(format(new Date(), 'yyyy-MM-dd'))
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {(habit.completedDates || []).includes(format(new Date(), 'yyyy-MM-dd'))
                      ? <BsCheck2 size={20} className="mr-1" />
                      : <BsX size={20} className="mr-1" />
                    }
                    {(habit.completedDates || []).includes(format(new Date(), 'yyyy-MM-dd'))
                      ? 'Completed Today'
                      : 'Mark Complete'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 21-Day Challenges Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">21-Day Challenges</h3>
              <button
                onClick={() => setShowChallengeModal(true)}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <BsPlus size={20} className="mr-1" />
                New Challenge
              </button>
            </div>
            <div className="space-y-6">
              {challenges.map(challenge => (
                <div key={challenge.id} className="border rounded-lg p-4">
                  <div className="mb-2">
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(challenge.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {challenge.days.map((completed, index) => (
                      <button
                        key={index}
                        onClick={() => toggleChallengeDay(challenge.id, index)}
                        className={`
                          p-2 rounded-lg text-xs font-medium
                          ${completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={e => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Modal */}
      {showHabitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Habit</h3>
            <form onSubmit={handleAddHabit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newHabit.title}
                  onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newHabit.description}
                  onChange={e => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={newHabit.frequency}
                  onChange={e => setNewHabit({ ...newHabit, frequency: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowHabitModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Start New 21-Day Challenge</h3>
            <form onSubmit={handleAddChallenge}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newChallenge.description}
                  onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={format(newChallenge.startDate, 'yyyy-MM-dd')}
                  onChange={e => setNewChallenge({ ...newChallenge, startDate: new Date(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChallengeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Start Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Calendar;

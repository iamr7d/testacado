import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Meeting with marketing department",
      date: new Date(2024, 0, 3),
      time: "10:00 AM"
    },
    {
      id: 2,
      title: "Developer Meetup",
      date: new Date(2024, 0, 7),
      time: "2:00 PM"
    },
    {
      id: 3,
      title: "Meet with friends",
      date: new Date(2024, 1, 4),
      time: "9:00 PM"
    }
  ]);
  const [selectedView, setSelectedView] = useState('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: new Date(), time: '' });

  useEffect(() => {
    // Load saved events from localStorage
    const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    const parsedEvents = savedEvents.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
    setEvents(prevEvents => [...prevEvents, ...parsedEvents]);

    // Set up notifications for upcoming deadlines
    parsedEvents.forEach(event => {
      if (event.type === 'deadline') {
        const deadlineDate = new Date(event.start);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        // Notify for deadlines within the next week
        if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
          if (Notification.permission === "granted") {
            new Notification("Upcoming PhD Deadline", {
              body: `Reminder: ${event.title} deadline is in ${daysUntilDeadline} days!`,
              icon: "/favicon.ico"
            });
          }
        }
      }
    });
  }, []);

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#4F46E5',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    if (event.type === 'deadline') {
      style.backgroundColor = '#DC2626';
      style.borderLeft = '4px solid #991B1B';
    }

    return {
      style
    };
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    setEvents([...events, { ...newEvent, id: events.length + 1 }]);
    setShowEventModal(false);
    setNewEvent({ title: '', date: new Date(), time: '' });
  };

  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  return (
    <section className="relative py-8 sm:p-8">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 xl:px-14">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-4">
            <h5 className="text-xl leading-8 font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h5>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToday}
                className="hidden md:flex py-2 pl-1.5 pr-3 rounded-md bg-gray-50 border border-gray-300 items-center gap-1.5 text-xs font-medium text-gray-900 transition-all duration-500 hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </button>
              <button 
                onClick={handlePrevMonth}
                className="text-gray-500 p-2 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={handleNextMonth}
                className="text-gray-500 p-2 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-px p-1 rounded-md bg-gray-100">
              <button 
                onClick={() => setSelectedView('day')}
                className={`py-2.5 px-5 rounded-lg ${selectedView === 'day' ? 'bg-white' : 'bg-gray-100'} text-sm font-medium text-gray-900 transition-all duration-300 hover:bg-white`}
              >
                Day
              </button>
              <button 
                onClick={() => setSelectedView('week')}
                className={`py-2.5 px-5 rounded-lg ${selectedView === 'week' ? 'bg-white' : 'bg-gray-100'} text-sm font-medium text-gray-900 transition-all duration-300 hover:bg-white`}
              >
                Week
              </button>
              <button 
                onClick={() => setSelectedView('month')}
                className={`py-2.5 px-5 rounded-lg ${selectedView === 'month' ? 'bg-white' : 'bg-gray-100'} text-sm font-medium text-gray-900 transition-all duration-300 hover:bg-white`}
              >
                Month
              </button>
            </div>
            <button 
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center">
                <span className="text-sm font-medium text-gray-900">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
            {getDaysInMonth().map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[120px] p-4 ${!isCurrentMonth ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                    isSameDay(day, new Date()) 
                      ? 'bg-indigo-600 text-white' 
                      : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className="p-1.5 bg-indigo-50 rounded text-xs text-indigo-700 font-medium"
                      >
                        {event.title}
                        <div className="text-indigo-500 text-[10px]">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => setNewEvent({...newEvent, date: new Date(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;

import React, { useState, useEffect } from 'react';
import { BsClock, BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const Calendar = ({ deadlines }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonthDays = (date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays = [];
    if (firstDay > 0) {
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
      const daysInPrevMonth = getDaysInMonth(prevMonth);
      for (let i = firstDay - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: daysInPrevMonth - i,
          isCurrentMonth: false
        });
      }
    }
    return prevMonthDays;
  };

  const getCurrentMonthDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      isCurrentMonth: true
    }));
  };

  const getNextMonthDays = (date) => {
    const totalDaysShown = 42; // 6 rows * 7 days
    const firstDay = getFirstDayOfMonth(date);
    const daysInMonth = getDaysInMonth(date);
    const remainingDays = totalDaysShown - (firstDay + daysInMonth);
    return Array.from({ length: remainingDays }, (_, i) => ({
      date: i + 1,
      isCurrentMonth: false
    }));
  };

  const getDeadlinesForDate = (year, month, day) => {
    return deadlines?.filter(deadline => {
      const deadlineDate = new Date(deadline.deadline);
      return deadlineDate.getFullYear() === year &&
             deadlineDate.getMonth() === month &&
             deadlineDate.getDate() === day;
    }) || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const allDays = [
    ...getPreviousMonthDays(currentDate),
    ...getCurrentMonthDays(currentDate),
    ...getNextMonthDays(currentDate)
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <section className="relative bg-stone-50">
      <div className="bg-sky-400 w-full sm:w-40 h-40 rounded-full absolute top-1 opacity-20 max-sm:right-0 sm:left-56 z-0"></div>
      <div className="bg-emerald-500 w-full sm:w-40 h-24 absolute top-0 -left-0 opacity-20 z-0"></div>
      <div className="bg-purple-600 w-full sm:w-40 h-24 absolute top-40 -left-0 opacity-20 z-0"></div>
      <div className="w-full py-24 relative z-10 backdrop-blur-3xl">
        <div className="w-full max-w-7xl mx-auto px-2 lg:px-8">
          <div className="grid grid-cols-12 gap-8 max-w-4xl mx-auto xl:max-w-full">
            <div className="col-span-12 xl:col-span-5">
              <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5">Upcoming Deadlines</h2>
              <p className="text-lg font-normal text-gray-600 mb-8">Don't miss important dates</p>
              <div className="flex gap-5 flex-col">
                {deadlines?.slice(0, 3).map((deadline, index) => (
                  <div key={index} className="p-6 rounded-xl bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        <p className="text-base font-medium text-gray-900">
                          {new Date(deadline.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <h6 className="text-xl leading-8 font-semibold text-black mb-1">{deadline.title}</h6>
                    <p className="text-base font-normal text-gray-600">{deadline.university}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-12 xl:col-span-7 px-2.5 py-5 sm:p-8 bg-gradient-to-b from-white/25 to-white xl:bg-white rounded-2xl max-xl:row-start-1">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h5 className="text-xl leading-8 font-semibold text-gray-900">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h5>
                  <div className="flex items-center">
                    <button onClick={handlePrevMonth} className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                      <BsChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextMonth} className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                      <BsChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border border-indigo-200 rounded-xl">
                <div className="grid grid-cols-7 rounded-t-3xl border-b border-indigo-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={i} className={`py-3.5 ${i !== 6 ? 'border-r' : ''} ${i === 0 ? 'rounded-tl-xl' : ''} ${i === 6 ? 'rounded-tr-xl' : ''} border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 rounded-b-xl">
                  {allDays.map((day, index) => {
                    const deadlinesForDay = getDeadlinesForDate(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day.date
                    );
                    
                    return (
                      <div key={index} className={`flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative
                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${index % 7 !== 6 ? 'border-r' : ''} 
                        border-b border-indigo-200 
                        transition-all duration-300 hover:bg-indigo-50 cursor-pointer`}>
                        <span className={`text-xs font-semibold ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                          {day.date}
                        </span>
                        {deadlinesForDay.map((deadline, i) => (
                          <div key={i} className="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-purple-50">
                            <p className="hidden xl:block text-xs font-medium text-purple-600 mb-px whitespace-nowrap">
                              {deadline.title}
                            </p>
                            <p className="xl:hidden w-2 h-2 rounded-full bg-purple-600"></p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calendar;

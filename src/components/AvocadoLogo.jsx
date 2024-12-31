import React from 'react';

const AvocadoLogo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Avocado body - gradient from green to darker green */}
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        fill="url(#avocado-gradient)"
      />
      
      {/* Pit/seed */}
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="#8B5E3C"
      />
      
      {/* Highlight/shine */}
      <path
        d="M8 8C8.5 7.5 9.5 7 10.5 7"
        stroke="white"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Academic cap */}
      <path
        d="M12 2L16 4.5L12 7L8 4.5L12 2Z"
        fill="#60A5FA"
      />
      <path
        d="M9 5.5V8L12 9.5L15 8V5.5"
        fill="#60A5FA"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="avocado-gradient"
          x1="12"
          y1="3"
          x2="12"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default AvocadoLogo;

import React from 'react';

const BackgroundHUD: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Deep Overlay - Adds that slight depth map feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#0ea5e9]/5"></div>

      {/* Runic / Circuit Lines overlay */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Main Diagonal Tracks */}
          <path d="M 0 200 L 300 500 L 1000 500 L 1200 300" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <path d="M -100 400 L 400 900 L 1200 900 L 1500 600" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="10 10" />
          
          {/* Top Right Clusters */}
          <path d="M 80% 0 L 70% 10% L 90% 30% L 100% 30%" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 70% 10% L 50% 10% L 40% 20%" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="5 5" />
          
          {/* Tech Nodes */}
          <circle cx="300" cy="500" r="4" fill="#38bdf8" className="animate-pulse" />
          <circle cx="1000" cy="500" r="6" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="1000" cy="500" r="2" fill="#0ea5e9" />
          <circle cx="70%" cy="10%" r="5" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1" />
          
          {/* Center Lines */}
          <path d="M 30% 50% L 40% 40% L 60% 40% L 70% 50%" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.5" />
          <path d="M 35% 55% L 45% 45% L 55% 45% L 65% 55%" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.2" />
          
          {/* Small Crosshairs */}
          <path d="M 20% 80% L 20% 75% M 20% 80% L 25% 80% M 20% 80% L 20% 85% M 20% 80% L 15% 80%" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 85% 70% L 85% 65% M 85% 70% L 90% 70% M 85% 70% L 85% 75% M 85% 70% L 80% 70%" stroke="#0ea5e9" strokeWidth="1" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
    </div>
  );
};

export default BackgroundHUD;

import React from 'react';

const BackgroundHUD: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none bg-black">
      {/* Deep Shadow Void Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#030914] via-black to-black opacity-100"></div>

      {/* Dynamic Shadow Aura (Epic and Dark) */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] opacity-50 mix-blend-screen"
        style={{
          background: `
            radial-gradient(circle at 40% 60%, rgba(14, 165, 233, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 60% 40%, rgba(107, 33, 168, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 0%, #000000 80%)
          `,
          animation: 'shadow-swirl 25s ease-in-out infinite alternate'
        }}
      ></div>

      {/* Floating Shadow Ash/Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(56,189,248,0.4)] animate-float-particle"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 15 + 10}s`,
              opacity: 0 // Handled by animation
            }}
          ></div>
        ))}
      </div>

      {/* Runic / Circuit Lines overlay - Very Subtle */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-screen">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Main Diagonal Tracks */}
          <path d="M 0 200 L 300 500 L 1000 500 L 1200 300" fill="none" stroke="#38bdf8" strokeWidth="1" />
          <path d="M -100 400 L 400 900 L 1200 900 L 1500 600" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="4 4" />
          
          {/* Top Right Clusters */}
          <path d="M 80% 0 L 70% 10% L 90% 30% L 100% 30%" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
          
          {/* Tech Nodes */}
          <circle cx="300" cy="500" r="3" fill="#38bdf8" className="animate-pulse" />
          <circle cx="1000" cy="500" r="4" fill="none" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="1000" cy="500" r="1.5" fill="#0ea5e9" />
          
          {/* Center Lines */}
          <path d="M 30% 50% L 40% 40% L 60% 40% L 70% 50%" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* Grid overlay - Darker */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.01)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

      {/* Vignette to focus center and darken edges heavily */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-95"></div>

      {/* CRT Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply"
        style={{
          background: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)
          `
        }}
      ></div>
    </div>
  );
};

export default BackgroundHUD;

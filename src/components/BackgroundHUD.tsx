import React from 'react';

const BackgroundHUD: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 select-none">
      {/* HUD 1 - Top Left (Focus on Counter-Rotating Layers) */}
      <div className="absolute -top-40 -left-40 w-[800px] h-[800px] opacity-40">
        <div className="relative w-full h-full animate-spin-slow">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Outer Segmented Ring */}
            <circle cx="200" cy="200" r="190" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="60 40" strokeOpacity="0.4" />
            <circle cx="200" cy="200" r="185" fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.8" />
            
            {/* Middle Rotating Arcs */}
            <path d="M200 40 A 160 160 0 0 1 360 200" fill="none" stroke="#ff007f" strokeWidth="8" strokeOpacity="0.3" strokeDasharray="10 5" />
            <path d="M40 200 A 160 160 0 0 1 200 40" fill="none" stroke="#00e5ff" strokeWidth="12" strokeOpacity="0.1" />
            
            {/* Inner Technical Ring */}
            <circle cx="200" cy="200" r="140" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="2 10" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="#ff007f" strokeWidth="2" strokeDasharray="40 100" />
          </svg>
          {/* Internal Counter-Rotate */}
          <div className="absolute inset-0 animate-spin-reverse flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-[70%] h-[70%]">
               <circle cx="200" cy="200" r="100" fill="none" stroke="#00e5ff" strokeWidth="10" strokeDasharray="5 20" strokeOpacity="0.2" />
               <circle cx="200" cy="200" r="90" fill="none" stroke="#ff007f" strokeWidth="1" strokeDasharray="1 1" />
            </svg>
          </div>
        </div>
      </div>

      {/* HUD 2 - Bottom Right (Complex Geometric Stack) */}
      <div className="absolute -bottom-60 -right-60 w-[1000px] h-[1000px] opacity-30">
        <div className="relative w-full h-full animate-spin-reverse">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <circle cx="250" cy="250" r="240" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.5" />
            <circle cx="250" cy="250" r="220" fill="none" stroke="#ff007f" strokeWidth="20" strokeDasharray="10 150" strokeOpacity="0.4" />
            <path d="M250 80 A 170 170 0 1 1 80 250" fill="none" stroke="#00e5ff" strokeWidth="2" strokeOpacity="0.6" />
            
            {/* Tick Marks Layer */}
            {[...Array(60)].map((_, i) => (
              <line 
                key={i} 
                x1="250" y1="30" x2="250" y2="45" 
                stroke="#00e5ff" 
                strokeWidth="1" 
                strokeOpacity="0.3"
                transform={`rotate(${i * 6} 250 250)`} 
              />
            ))}
          </svg>
          {/* Inner Core */}
          <div className="absolute inset-0 animate-spin-slow flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-[50%] h-[50%]">
              <circle cx="250" cy="250" r="150" fill="none" stroke="#ff007f" strokeWidth="4" strokeDasharray="100 20" strokeOpacity="0.3" />
              <circle cx="250" cy="250" r="130" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="5 5" />
            </svg>
          </div>
        </div>
      </div>

      {/* HUD 3 - Center Top Right (Focus on Reference's Magenta Center) */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] opacity-50">
        <div className="relative w-full h-full animate-spin-slow">
            <svg viewBox="0 0 300 300" className="w-full h-full">
                <circle cx="150" cy="150" r="140" fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="10 10" />
                <circle cx="150" cy="150" r="120" fill="none" stroke="#ff007f" strokeWidth="12" strokeDasharray="2 20" strokeOpacity="0.8" />
                <path d="M150 50 A 100 100 0 0 1 250 150" fill="none" stroke="#00e5ff" strokeWidth="25" strokeOpacity="0.1" />
                <circle cx="150" cy="150" r="80" fill="none" stroke="#ff007f" strokeWidth="2" strokeDasharray="40 10" />
            </svg>
        </div>
      </div>

      {/* Grid Lines & Technical Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
      
      {/* HUD 4 - Corner Fragments */}
      <div className="absolute bottom-10 left-10 w-60 h-60 opacity-20 animate-glow-pulse">
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect x="10" y="10" width="180" height="180" fill="none" stroke="#00e5ff" strokeWidth="0.5" opacity="0.3" />
            <path d="M10 50 L10 10 L50 10" fill="none" stroke="#00e5ff" strokeWidth="2" />
            <path d="M150 190 L190 190 L190 150" fill="none" stroke="#ff007f" strokeWidth="2" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="5 5" />
        </svg>
      </div>
    </div>
  );
};

export default BackgroundHUD;

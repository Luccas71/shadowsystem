import React from 'react';

const BackgroundHUD: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#05030a]">
      {/* Dimensional Rift Base / Nebulous Shadow Void - Visible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a103c] via-[#0b0a1a] to-[#050510] opacity-100"></div>

      {/* Deep Space / Rift Core - Visible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_var(--tw-gradient-stops))] from-[#4c1d95]/40 via-transparent to-transparent opacity-100 mix-blend-screen"></div>

      {/* Dynamic Shadow Flames / Aura - Brighter Colors */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] opacity-70 mix-blend-screen"
        style={{
          background: `
            radial-gradient(ellipse at 30% 70%, rgba(56, 189, 248, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.4) 0%, transparent 60%)
          `,
          animation: 'shadow-swirl 25s ease-in-out infinite alternate'
        }}
      ></div>
      
      {/* Moving Shadow Wisps - Brighter Colors */}
      <div className="absolute inset-0 opacity-60 mix-blend-color-dodge animate-pulse" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)`,
          animationDuration: '12s'
        }}
      ></div>

      {/* Floating Shadow Particles / Sparks - Vibrant */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float-particle ${i % 3 === 0 ? 'bg-[#38bdf8] shadow-[0_0_10px_2px_rgba(56,189,248,0.6)]' : 'bg-[#c084fc] shadow-[0_0_10px_2px_rgba(192,132,252,0.6)]'}`}
            style={{
              width: `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 15 + 15}s`,
              opacity: 0 // Handled by animation
            }}
          ></div>
        ))}
      </div>

      {/* Runic Overlay - Highly Visible */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-screen flex items-center justify-center">
        <div className="w-[120vw] max-w-[1200px] aspect-square rounded-full border-[1px] border-[#a78bfa]/40 animate-spin-slow" style={{ animationDuration: '200s' }}></div>
        <div className="absolute w-[90vw] max-w-[900px] aspect-square rounded-full border-[2px] border-dashed border-[#38bdf8]/30 animate-spin-reverse" style={{ animationDuration: '150s' }}></div>
        <div className="absolute w-[60vw] max-w-[600px] aspect-square rounded-full border-[1px] border-[#818cf8]/50 opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
      </div>

      {/* Perspective Grid overlay - Visible */}
      <div className="absolute inset-x-0 bottom-0 h-[60vh] overflow-hidden opacity-[0.3]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(192,132,252,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(192,132,252,0.5)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(1000px)_rotateX(75deg)_translateY(100px)_scale(3)] [transform-origin:bottom_center]"></div>
        {/* Floor fade out to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#05030a]/90 to-[#05030a]"></div>
      </div>

      {/* Vignette - Reduced to increase visibility */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-40"></div>

      {/* CRT Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply"
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

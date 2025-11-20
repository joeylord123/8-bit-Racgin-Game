import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete boot sequence after fade finishes (approx 3.5s total)
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a1a1a] transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* 8-bit Logo Container */}
      <div className="relative mb-8 animate-pulse">
        {/* 
          Pixel Art Logo based on user profile (Man with glasses in 8-bit style) 
          Grid size approx 24x24
        */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="image-pixelated">
          <rect width="24" height="24" fill="#1a1a1a"/>
          
          {/* Skin / Face */}
          <rect x="7" y="6" width="10" height="9" fill="#fca5a5"/> {/* Face shape */}
          <rect x="6" y="8" width="1" height="4" fill="#fca5a5"/>  {/* Ear L */}
          <rect x="17" y="8" width="1" height="4" fill="#fca5a5"/> {/* Ear R */}
          <rect x="8" y="15" width="8" height="2" fill="#fca5a5"/> {/* Neck */}

          {/* Hair (Spiky Black) */}
          <rect x="7" y="4" width="10" height="2" fill="#111"/>
          <rect x="6" y="5" width="1" height="3" fill="#111"/>
          <rect x="17" y="5" width="1" height="2" fill="#111"/>
          <rect x="9" y="3" width="2" height="1" fill="#111"/> {/* Spike */}
          <rect x="12" y="2" width="3" height="2" fill="#111"/> {/* Spike */}
          <rect x="15" y="3" width="2" height="1" fill="#111"/> {/* Spike */}

          {/* Glasses (Black rim + glint) */}
          <rect x="7" y="9" width="4" height="2" fill="#111"/>
          <rect x="13" y="9" width="4" height="2" fill="#111"/>
          <rect x="11" y="10" width="2" height="1" fill="#111"/> {/* Bridge */}
          <rect x="6" y="9" width="1" height="1" fill="#111"/>
          <rect x="17" y="9" width="1" height="1" fill="#111"/>
          {/* Glint in glasses */}
          <rect x="8" y="9" width="1" height="1" fill="#60a5fa"/>
          <rect x="14" y="9" width="1" height="1" fill="#60a5fa"/>

          {/* Suit / Clothes */}
          <rect x="5" y="17" width="14" height="7" fill="#374151"/> {/* Jacket */}
          <rect x="9" y="17" width="6" height="7" fill="#1f2937"/> {/* Shirt/Inner */}
          <rect x="11" y="17" width="2" height="7" fill="#fff"/>   {/* Shirt strip */}
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl text-white font-bold tracking-widest drop-shadow-md">
          <span className="text-red-500">J</span>OEY <span className="text-blue-500">G</span>AMES
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
        <p className="text-[8px] text-gray-500 tracking-[0.5em] mt-2 uppercase">EST. 2025</p>
      </div>

    </div>
  );
};

export default BootScreen;
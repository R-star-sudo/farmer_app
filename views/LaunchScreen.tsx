
import React, { useState, useEffect } from 'react';
import { Sprout, Wifi, Battery, Signal } from 'lucide-react';

interface LaunchScreenProps {
  onLaunch: () => void;
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onLaunch }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center relative overflow-hidden flex flex-col items-center"
      style={{ 
        backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")', // Nature/Field background
      }}
    >
      {/* Mobile Status Bar */}
      <div className="w-full px-6 py-3 flex justify-between items-center text-white text-xs font-medium z-10 bg-gradient-to-b from-black/30 to-transparent">
        <span>{time}</span>
        <div className="flex items-center gap-2">
          <Signal size={14} />
          <Wifi size={14} />
          <Battery size={16} />
        </div>
      </div>

      {/* App Grid Area */}
      <div className="flex-1 w-full p-6 grid grid-cols-4 gap-6 content-start pt-12">
        
        {/* KisanSmart App Icon */}
        <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onLaunch}>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl shadow-xl flex items-center justify-center transform transition-all duration-200 group-active:scale-90 group-hover:scale-105 relative overflow-hidden border-[1px] border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-transparent"></div>
            <Sprout size={36} className="text-white drop-shadow-md" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">KisanSmart</span>
        </div>

        {/* Dummy Icons for realism */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 opacity-80 grayscale hover:grayscale-0 transition-all">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-white/30 rounded-full"></div>
            </div>
            <span className="text-white/80 text-xs font-medium drop-shadow-md">App {i + 1}</span>
          </div>
        ))}
      </div>

      {/* Dock Area */}
      <div className="w-full p-4 mb-2">
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 flex justify-around items-center mx-2">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg opacity-90"></div>
           ))}
        </div>
      </div>
    </div>
  );
};

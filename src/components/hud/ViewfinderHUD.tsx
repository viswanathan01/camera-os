import React, { useEffect, useState } from 'react';
import { useCameraStore, MODE_LABELS } from '@/stores/cameraStore';

export const ViewfinderHUD: React.FC = () => {
  const { currentMode, isFocused, focusTarget } = useCameraStore();
  const [time, setTime] = useState(new Date());
  const [batteryLevel] = useState(87);
  const [isoValue] = useState(400);
  const [apertureValue] = useState(2.8);
  const [shutterSpeed] = useState('1/250');
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 p-6 font-mono text-xs">
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Top bar */}
      <div className="flex justify-between items-start text-white/70">
        {/* Left - Mode and status */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-white/10 rounded text-white">
              {currentMode}
            </span>
            <span className="text-white/50">{MODE_LABELS[currentMode]}</span>
          </div>
          
          {/* Recording indicator for REC mode */}
          {currentMode === 'REC' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500">REC</span>
            </div>
          )}
        </div>
        
        {/* Center - Focus indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          {isFocused && (
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>FOCUS LOCK</span>
              {focusTarget && <span className="text-white/50">({focusTarget})</span>}
            </div>
          )}
        </div>
        
        {/* Right - Camera settings */}
        <div className="text-right space-y-1">
          <div className="flex items-center gap-3 justify-end">
            {/* Battery */}
            <div className="flex items-center gap-1">
              <div className="w-6 h-3 border border-white/50 rounded-sm relative">
                <div 
                  className="absolute inset-0.5 bg-green-400 rounded-sm"
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <div className="w-1 h-1.5 bg-white/50 rounded-r-sm" />
            </div>
            <span>{batteryLevel}%</span>
          </div>
          <div className="text-white/50">{formatTime(time)}</div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
        {/* Left - Exposure settings */}
        <div className="flex items-center gap-6 text-white/70">
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-[10px]">ISO</span>
            <span className="text-white">{isoValue}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-[10px]">ƒ</span>
            <span className="text-white">{apertureValue}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-[10px]">SHUTTER</span>
            <span className="text-white">{shutterSpeed}</span>
          </div>
        </div>
        
        {/* Center - Focus points grid */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-20">
          <div className="grid grid-cols-5 gap-4 opacity-30">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 border ${i === 7 ? 'border-red-500' : 'border-white/30'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Right - Exposure meter */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-white/40 text-[10px]">EV</div>
          <div className="flex items-center gap-1">
            <span className="text-white/50">-</span>
            <div className="w-24 h-1 bg-white/20 rounded-full relative">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-3 bg-white rounded-sm"
                style={{ left: '50%' }}
              />
            </div>
            <span className="text-white/50">+</span>
          </div>
        </div>
      </div>
      
      {/* Corner brackets */}
      <div className="absolute top-20 left-20 w-12 h-12 border-t-2 border-l-2 border-white/20" />
      <div className="absolute top-20 right-20 w-12 h-12 border-t-2 border-r-2 border-white/20" />
      <div className="absolute bottom-20 left-20 w-12 h-12 border-b-2 border-l-2 border-white/20" />
      <div className="absolute bottom-20 right-20 w-12 h-12 border-b-2 border-r-2 border-white/20" />
      
      {/* Sensor noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

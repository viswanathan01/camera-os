import React, { useRef, useEffect, useState } from 'react';
import { useCameraStore, MODES, MODE_LABELS, CameraMode } from '@/stores/cameraStore';
import { useAudio } from '@/hooks/useAudio';
import gsap from 'gsap';

export const ModeDial: React.FC = () => {
  const { currentMode, setMode, setTransitioning, setShutterOpen } = useCameraStore();
  const { playClick, playShutter } = useAudio();
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const rotationRef = useRef(0);
  
  const currentIndex = MODES.indexOf(currentMode);
  const anglePerMode = 360 / MODES.length;
  
  useEffect(() => {
    rotationRef.current = -currentIndex * anglePerMode;
    if (dialRef.current) {
      gsap.to(dialRef.current, {
        rotation: rotationRef.current,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  }, [currentIndex, anglePerMode]);
  
  const handleModeChange = (newMode: CameraMode) => {
    if (newMode === currentMode) return;
    
    playClick();
    setTransitioning(true);
    setShutterOpen(false);
    
    setTimeout(() => {
      playShutter();
      setMode(newMode);
      
      setTimeout(() => {
        setShutterOpen(true);
        setTimeout(() => {
          setTransitioning(false);
        }, 300);
      }, 150);
    }, 200);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + MODES.length) % MODES.length;
    handleModeChange(MODES[newIndex]);
  };
  
  const getAngle = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };
  
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setStartAngle(getAngle(e) - rotationRef.current);
  };
  
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentAngle = getAngle(e);
    const newRotation = currentAngle - startAngle;
    
    // Calculate which mode we're closest to
    const normalizedRotation = (((-newRotation % 360) + 360) % 360);
    const closestIndex = Math.round(normalizedRotation / anglePerMode) % MODES.length;
    
    if (closestIndex !== currentIndex) {
      handleModeChange(MODES[closestIndex]);
    }
  };
  
  const handleEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      className="fixed bottom-8 right-8 z-50 select-none"
      onWheel={handleWheel}
    >
      {/* Mode label */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xs text-white/50 tracking-[0.3em] uppercase mb-1">MODE</div>
        <div className="text-lg font-mono text-white tracking-wider">{MODE_LABELS[currentMode]}</div>
      </div>
      
      {/* Dial housing */}
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl border border-zinc-700/50">
        {/* Inner shadow ring */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-zinc-900 to-black shadow-inner" />
        
        {/* Rotating dial */}
        <div
          ref={dialRef}
          className="absolute inset-4 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 cursor-grab active:cursor-grabbing"
          style={{
            boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Mode markers */}
          {MODES.map((mode, i) => {
            const angle = (i * anglePerMode) * (Math.PI / 180);
            const radius = 36;
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;
            const isActive = mode === currentMode;
            
            return (
              <div
                key={mode}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <button
                  onClick={() => handleModeChange(mode)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-black shadow-lg shadow-white/20' 
                      : 'bg-zinc-600/50 text-white/70 hover:bg-zinc-500/50'
                    }
                    ${mode === 'REC' ? 'text-red-500' : ''}
                  `}
                >
                  {mode === 'REC' ? '●' : mode}
                </button>
              </div>
            );
          })}
          
          {/* Center knob */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 shadow-inner flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-zinc-500" />
          </div>
        </div>
        
        {/* Indicator notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500" />
        </div>
        
        {/* Click stops (visual) */}
        {Array.from({ length: MODES.length * 2 }).map((_, i) => {
          const angle = (i * (360 / (MODES.length * 2))) * (Math.PI / 180);
          const radius = 62;
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-zinc-600"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

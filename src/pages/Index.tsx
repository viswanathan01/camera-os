import React, { useEffect, useState } from 'react';
import { CameraScene } from '@/components/camera/CameraScene';
import { FocusReticle } from '@/components/cursor/FocusReticle';
import { ModeDial } from '@/components/camera/ModeDial';
import { ShutterTransition } from '@/components/shutter/ShutterTransition';
import { ViewfinderHUD } from '@/components/hud/ViewfinderHUD';
import { useCameraStore } from '@/stores/cameraStore';

const Index: React.FC = () => {
  const { toggleAudio, audioEnabled, currentMode } = useCameraStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Loading state - film loading metaphor
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Loading screen - film loading */}
      {isLoading && (
        <div className="absolute inset-0 z-[10000] bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-white/20 font-mono text-xs tracking-widest mb-4">
              LOADING FILM
            </div>
            <div className="w-48 h-1 bg-white/10 overflow-hidden">
              <div className="h-full bg-white/40 animate-[loading_1.5s_ease-in-out]" />
            </div>
            <div className="text-white/10 font-mono text-xs mt-4">
              CAMERA-OS v1.0
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Scene */}
      <CameraScene />
      
      {/* UI Overlays - with safe margins */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Safe frame indicator (subtle) */}
        <div className="absolute inset-[5%] border border-white/5 pointer-events-none" />
      </div>
      
      {/* Focus Reticle - always visible cursor replacement */}
      <FocusReticle />
      
      {/* Viewfinder HUD */}
      <ViewfinderHUD />
      
      {/* Mode Dial - bottom right safe zone */}
      <ModeDial />
      
      {/* Shutter Transition */}
      <ShutterTransition />
      
      {/* Audio toggle - top right */}
      <button
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all font-mono text-xs pointer-events-auto"
        data-interactive
      >
        {audioEnabled ? '♪' : '✕'}
      </button>
      
      {/* Studio branding - top left safe zone */}
      <div className="fixed top-6 left-6 z-50 pointer-events-none">
        <div className="text-white/80 font-medium tracking-widest text-sm">
          SUBA STUDIOS
        </div>
        <div className="text-white/30 font-mono text-xs mt-1">
          {currentMode === 'M' && 'HOME'}
          {currentMode === 'Av' && 'PORTFOLIO'}
          {currentMode === 'Tv' && 'FILMS'}
          {currentMode === 'P' && 'SERVICES'}
          {currentMode === 'ISO' && 'ABOUT'}
          {currentMode === 'REC' && 'CONTACT'}
        </div>
      </div>
      
      {/* Instructions - bottom left, subtle */}
      <div className="fixed bottom-6 left-6 z-50 text-white/20 font-mono text-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border border-white/20 rounded-full flex items-center justify-center text-[8px]">↺</span>
          <span>ROTATE DIAL TO NAVIGATE</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-4 h-4 border border-white/20 rounded-full flex items-center justify-center text-[8px]">◎</span>
          <span>MOVE TO FOCUS</span>
        </div>
      </div>
      
      {/* Mode indicator bar - bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 pointer-events-none">
        {['M', 'Av', 'Tv', 'P', 'ISO', 'REC'].map((mode) => (
          <div 
            key={mode}
            className={`w-8 h-1 transition-all duration-300 ${
              currentMode === mode 
                ? 'bg-white' 
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      
      {/* Custom loading animation keyframes */}
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Index;

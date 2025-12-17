import React, { useEffect } from 'react';
import { CameraScene } from '@/components/camera/CameraScene';
import { FocusReticle } from '@/components/cursor/FocusReticle';
import { ModeDial } from '@/components/camera/ModeDial';
import { ShutterTransition } from '@/components/shutter/ShutterTransition';
import { ViewfinderHUD } from '@/components/hud/ViewfinderHUD';
import { useCameraStore } from '@/stores/cameraStore';
import { useAudio } from '@/hooks/useAudio';

const Index: React.FC = () => {
  const { toggleAudio, audioEnabled } = useCameraStore();
  
  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {/* 3D Scene */}
      <CameraScene />
      
      {/* UI Overlays */}
      <FocusReticle />
      <ViewfinderHUD />
      <ModeDial />
      <ShutterTransition />
      
      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all font-mono text-xs"
      >
        {audioEnabled ? '♪' : '✕'}
      </button>
      
      {/* Instructions (fades out) */}
      <div className="fixed bottom-8 left-8 z-50 text-white/30 font-mono text-xs animate-pulse">
        <div>ROTATE DIAL OR SCROLL TO NAVIGATE</div>
        <div className="mt-1">MOVE CURSOR TO INTERACT</div>
      </div>
    </div>
  );
};

export default Index;

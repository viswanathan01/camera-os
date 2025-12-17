import React, { useEffect, useState, useRef } from 'react';
import { useCameraStore } from '@/stores/cameraStore';
import gsap from 'gsap';

export const FocusReticle: React.FC = () => {
  const { cursorPosition, setCursorPosition, isFocused } = useCameraStore();
  const [isVisible, setIsVisible] = useState(false);
  const reticleRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition(e.clientX, e.clientY);
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [setCursorPosition]);
  
  useEffect(() => {
    if (reticleRef.current) {
      gsap.to(reticleRef.current, {
        x: cursorPosition.x,
        y: cursorPosition.y,
        duration: 0.1,
        ease: 'power2.out',
      });
    }
    
    if (trailRef.current) {
      gsap.to(trailRef.current, {
        x: cursorPosition.x,
        y: cursorPosition.y,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [cursorPosition]);
  
  useEffect(() => {
    if (innerRef.current) {
      if (isFocused) {
        gsap.to(innerRef.current, {
          scale: 0.8,
          borderColor: 'hsl(142, 76%, 46%)',
          duration: 0.15,
          ease: 'back.out(2)',
        });
      } else {
        gsap.to(innerRef.current, {
          scale: 1,
          borderColor: 'hsl(0, 0%, 100%)',
          duration: 0.15,
          ease: 'power2.out',
        });
      }
    }
  }, [isFocused]);
  
  if (!isVisible) return null;
  
  return (
    <>
      {/* Light trail */}
      <div
        ref={trailRef}
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      
      {/* Main reticle */}
      <div
        ref={reticleRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      >
        {/* Outer ring */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
          style={{ width: 40, height: 40 }}
        />
        
        {/* Inner focus ring */}
        <div
          ref={innerRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ width: 20, height: 20 }}
        />
        
        {/* Focus brackets */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ width: 50, height: 50 }}>
          {/* Top-left */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/60" />
          {/* Top-right */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/60" />
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/60" />
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/60" />
        </div>
        
        {/* Center dot */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ 
            width: 4, 
            height: 4,
            boxShadow: isFocused ? '0 0 10px hsl(142, 76%, 46%)' : '0 0 5px rgba(255,255,255,0.5)'
          }}
        />
      </div>
    </>
  );
};

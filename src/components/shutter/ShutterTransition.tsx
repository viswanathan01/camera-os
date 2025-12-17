import React, { useEffect, useRef } from 'react';
import { useCameraStore } from '@/stores/cameraStore';
import gsap from 'gsap';

const BLADE_COUNT = 8;

export const ShutterTransition: React.FC = () => {
  const { shutterOpen, isTransitioning } = useCameraStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const bladesRef = useRef<(HTMLDivElement | null)[]>([]);
  const dustRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline();
    
    if (!shutterOpen) {
      // Close iris
      tl.to(containerRef.current, {
        opacity: 1,
        duration: 0.05,
        pointerEvents: 'auto',
      });
      
      bladesRef.current.forEach((blade, i) => {
        if (blade) {
          tl.to(blade, {
            rotation: 0,
            scale: 1,
            duration: 0.15,
            ease: 'power2.in',
          }, 0.02 * i);
        }
      });
      
      // Show dust particles
      if (dustRef.current) {
        tl.to(dustRef.current, {
          opacity: 1,
          duration: 0.1,
        }, 0.1);
      }
    } else {
      // Open iris
      if (dustRef.current) {
        tl.to(dustRef.current, {
          opacity: 0,
          duration: 0.1,
        }, 0);
      }
      
      bladesRef.current.forEach((blade, i) => {
        if (blade) {
          tl.to(blade, {
            rotation: 45,
            scale: 1.5,
            duration: 0.2,
            ease: 'power2.out',
          }, 0.02 * i);
        }
      });
      
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.1,
        pointerEvents: 'none',
      }, 0.15);
    }
  }, [shutterOpen]);
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none opacity-0"
      style={{ background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.95) 100%)' }}
    >
      {/* Iris blades */}
      <div className="relative w-[200vmax] h-[200vmax]">
        {Array.from({ length: BLADE_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (bladesRef.current[i] = el)}
            className="absolute top-1/2 left-1/2 origin-center"
            style={{
              width: '100%',
              height: '100%',
              transform: `rotate(${(360 / BLADE_COUNT) * i}deg) scale(1.5)`,
              background: `linear-gradient(${90 + (360 / BLADE_COUNT) * i}deg, 
                transparent 0%, 
                rgba(20,20,20,1) 45%, 
                rgba(10,10,10,1) 50%, 
                rgba(20,20,20,1) 55%, 
                transparent 100%)`,
            }}
          />
        ))}
      </div>
      
      {/* Dust particles */}
      <div
        ref={dustRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Center aperture */}
      <div 
        className="absolute rounded-full border-4 border-zinc-800"
        style={{
          width: shutterOpen ? '200vmax' : 0,
          height: shutterOpen ? '200vmax' : 0,
          transition: 'all 0.3s ease-out',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
        }}
      />
    </div>
  );
};

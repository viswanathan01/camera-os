import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useCameraStore } from '@/stores/cameraStore';
import gsap from 'gsap';

type CursorState = 'default' | 'hover' | 'focus' | 'drag' | 'capture';

export const FocusReticle: React.FC = () => {
  const { cursorPosition, setCursorPosition, isFocused, focusTarget } = useCameraStore();
  const [isVisible, setIsVisible] = useState(true);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isInteractive, setIsInteractive] = useState(false);
  
  const reticleRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const bracketsRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  
  // Track interactive elements
  const checkInteractiveElement = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = !!(
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-interactive]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="button"]') ||
      target.tagName === 'CANVAS'
    );
    setIsInteractive(interactive);
    
    if (target.closest('[data-capture]')) {
      setCursorState('capture');
    } else if (target.closest('[data-drag]')) {
      setCursorState('drag');
    } else if (interactive) {
      setCursorState('hover');
    } else {
      setCursorState('default');
    }
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition(e.clientX, e.clientY);
      setIsVisible(true);
      checkInteractiveElement(e);
    };
    
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [setCursorPosition, checkInteractiveElement]);
  
  // Smooth cursor movement
  useEffect(() => {
    if (reticleRef.current) {
      gsap.to(reticleRef.current, {
        x: cursorPosition.x,
        y: cursorPosition.y,
        duration: 0.08,
        ease: 'power2.out',
      });
    }
    
    if (trailRef.current) {
      gsap.to(trailRef.current, {
        x: cursorPosition.x,
        y: cursorPosition.y,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  }, [cursorPosition]);
  
  // Focus state animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    if (isFocused) {
      // Focus lock animation
      tl.to(innerRef.current, {
        scale: 0.7,
        borderColor: 'hsl(142, 76%, 46%)',
        borderWidth: 3,
        duration: 0.15,
        ease: 'back.out(2)',
      }, 0);
      
      tl.to(outerRef.current, {
        scale: 0.9,
        borderColor: 'hsl(142, 76%, 46%)',
        opacity: 0.8,
        duration: 0.15,
        ease: 'power2.out',
      }, 0);
      
      tl.to(bracketsRef.current, {
        scale: 0.85,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
      
      // Pulse animation on focus lock
      if (pulseRef.current) {
        gsap.fromTo(pulseRef.current, 
          { scale: 0.5, opacity: 0.8 },
          { scale: 2, opacity: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    } else {
      tl.to(innerRef.current, {
        scale: 1,
        borderColor: 'hsl(0, 0%, 100%)',
        borderWidth: 2,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
      
      tl.to(outerRef.current, {
        scale: 1,
        borderColor: 'hsl(0, 0%, 100%)',
        opacity: 0.3,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
      
      tl.to(bracketsRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      }, 0);
    }
  }, [isFocused]);
  
  // Cursor state animations
  useEffect(() => {
    if (!reticleRef.current) return;
    
    const states = {
      default: { scale: 1, rotation: 0 },
      hover: { scale: 1.2, rotation: 0 },
      focus: { scale: 0.8, rotation: 0 },
      drag: { scale: 1.1, rotation: 45 },
      capture: { scale: 1.5, rotation: 0 },
    };
    
    gsap.to(reticleRef.current, {
      scale: states[cursorState].scale,
      rotation: states[cursorState].rotation,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, [cursorState]);
  
  // Breathing animation for lens effect
  useEffect(() => {
    if (!innerRef.current || !outerRef.current) return;
    
    const breathe = gsap.timeline({ repeat: -1, yoyo: true });
    breathe.to([innerRef.current, outerRef.current], {
      scale: '+=0.03',
      duration: 2,
      ease: 'sine.inOut',
    });
    
    return () => {
      breathe.kill();
    };
  }, []);
  
  const focusColor = isFocused ? 'hsl(142, 76%, 46%)' : 'hsl(0, 0%, 100%)';
  
  return (
    <>
      {/* Light trail - longer persistence for exposure effect */}
      <div
        ref={trailRef}
        className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${isFocused ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.08)'} 0%, transparent 70%)`,
          filter: 'blur(10px)',
          zIndex: 9997,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      {/* Main reticle container */}
      <div
        ref={reticleRef}
        className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ 
          zIndex: 9999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* Pulse ring on focus */}
        <div
          ref={pulseRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ 
            width: 30, 
            height: 30,
            borderColor: focusColor,
            opacity: 0,
          }}
        />
        
        {/* Outer ring */}
        <div 
          ref={outerRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ 
            width: 44, 
            height: 44,
            border: '1px solid',
            borderColor: focusColor,
            opacity: 0.3,
          }}
        />
        
        {/* Inner focus ring */}
        <div
          ref={innerRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ 
            width: 22, 
            height: 22,
            border: '2px solid',
            borderColor: focusColor,
          }}
        />
        
        {/* Focus brackets */}
        <div 
          ref={bracketsRef}
          className="absolute -translate-x-1/2 -translate-y-1/2" 
          style={{ width: 54, height: 54 }}
        >
          {/* Top-left */}
          <div 
            className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
            style={{ borderColor: `${focusColor}99` }}
          />
          {/* Top-right */}
          <div 
            className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2"
            style={{ borderColor: `${focusColor}99` }}
          />
          {/* Bottom-left */}
          <div 
            className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2"
            style={{ borderColor: `${focusColor}99` }}
          />
          {/* Bottom-right */}
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
            style={{ borderColor: `${focusColor}99` }}
          />
        </div>
        
        {/* Center dot with glow */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ 
            width: 6, 
            height: 6,
            backgroundColor: focusColor,
            boxShadow: isFocused 
              ? '0 0 12px hsl(142, 76%, 46%), 0 0 24px hsl(142, 76%, 46%)' 
              : '0 0 6px rgba(255,255,255,0.5)'
          }}
        />
        
        {/* Focus target label */}
        {isFocused && focusTarget && (
          <div 
            className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs"
            style={{ color: 'hsl(142, 76%, 46%)' }}
          >
            <span className="opacity-60">◉</span> {focusTarget}
          </div>
        )}
        
        {/* Interactive state indicator */}
        {isInteractive && !isFocused && (
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
            style={{ 
              width: 60, 
              height: 60,
              border: '1px solid rgba(255,255,255,0.2)',
              animationDuration: '1.5s',
            }}
          />
        )}
      </div>
      
      {/* Fallback system cursor for accessibility (invisible but functional) */}
      <style>{`
        * { cursor: none !important; }
        input, textarea, [contenteditable] { cursor: text !important; }
      `}</style>
    </>
  );
};

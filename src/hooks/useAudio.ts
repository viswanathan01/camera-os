import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { useCameraStore } from '@/stores/cameraStore';

// Synthesized audio using Web Audio API for mechanical sounds
const createMechanicalClick = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };
};

const createShutterSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    // First click (mirror up)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    osc1.frequency.setValueAtTime(3000, audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.03);
    gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.03);
    
    // Second click (shutter)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.setValueAtTime(4000, audioContext.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    osc2.start(audioContext.currentTime + 0.05);
    osc2.stop(audioContext.currentTime + 0.1);
  };
};

const createFocusBeep = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2400, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    // Second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2400, audioContext.currentTime);
      gain2.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.1);
    }, 120);
  };
};

export const useAudio = () => {
  const audioEnabled = useCameraStore((state) => state.audioEnabled);
  const clickRef = useRef<(() => void) | null>(null);
  const shutterRef = useRef<(() => void) | null>(null);
  const focusRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    clickRef.current = createMechanicalClick();
    shutterRef.current = createShutterSound();
    focusRef.current = createFocusBeep();
  }, []);
  
  const playClick = useCallback(() => {
    if (audioEnabled && clickRef.current) {
      clickRef.current();
    }
  }, [audioEnabled]);
  
  const playShutter = useCallback(() => {
    if (audioEnabled && shutterRef.current) {
      shutterRef.current();
    }
  }, [audioEnabled]);
  
  const playFocus = useCallback(() => {
    if (audioEnabled && focusRef.current) {
      focusRef.current();
    }
  }, [audioEnabled]);
  
  return { playClick, playShutter, playFocus };
};

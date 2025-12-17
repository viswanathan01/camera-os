import React, { useState, useRef, useEffect } from 'react';
import { Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';

export const ContactMode: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [formData, setFormData] = useState({
    subject: '',
    timestamp: '',
    caption: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const screenRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);
  
  useFrame((state) => {
    if (screenRef.current && isRecording) {
      // Subtle screen flicker
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
    }
  });
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = () => {
    setIsSubmitted(true);
    // Here you would handle the actual form submission
  };
  
  return (
    <group>
      {/* Camera back LCD screen */}
      <mesh ref={screenRef} position={[0, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color="#111111"
          emissive="#111111"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Screen border */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[6.3, 4.3, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Recording tally light */}
      <mesh position={[2.8, 1.8, 0.1]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color={isRecording ? '#ff0000' : '#330000'} />
      </mesh>
      
      {/* REC indicator */}
      {isRecording && (
        <Text
          position={[2.4, 1.8, 0.1]}
          fontSize={0.12}
          color="#ff0000"
          anchorX="right"
        >
          ● REC
        </Text>
      )}
      
      {/* Timer */}
      <Text
        position={[-2.5, 1.8, 0.1]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="left"
        font="/fonts/mono"
      >
        {formatTime(recordingTime)}
      </Text>
      
      {/* Form content */}
      <Html position={[0, 0, 0.2]} center transform scale={0.15}>
        <div className="w-[600px] p-8 font-mono">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Subject field */}
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  &gt; SUBJECT_
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-transparent border border-white/20 p-3 text-white focus:border-green-400 focus:outline-none"
                  placeholder="Your name or organization"
                />
              </div>
              
              {/* Timestamp field */}
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  &gt; TIMESTAMP_
                </label>
                <input
                  type="email"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  className="w-full bg-transparent border border-white/20 p-3 text-white focus:border-green-400 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
              
              {/* Caption field */}
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  &gt; CAPTION_
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full bg-transparent border border-white/20 p-3 text-white focus:border-green-400 focus:outline-none h-32 resize-none"
                  placeholder="Tell us about your vision..."
                />
              </div>
              
              {/* Submit button */}
              <button
                onClick={() => {
                  setIsRecording(true);
                  setTimeout(handleSubmit, 2000);
                }}
                disabled={isRecording}
                className={`
                  w-full py-4 border-2 transition-all duration-300
                  ${isRecording 
                    ? 'border-red-500 text-red-500 animate-pulse' 
                    : 'border-white text-white hover:bg-white hover:text-black'
                  }
                `}
              >
                {isRecording ? '◉ RECORDING...' : '[ CAPTURE MOMENT ]'}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              {/* Success state - ticket print */}
              <div className="border-2 border-dashed border-white/30 p-6">
                <div className="text-green-400 text-2xl mb-4">✓ CAPTURED</div>
                <div className="text-white/60 text-sm">
                  Your moment has been recorded.
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="text-xs text-white/40">BOOKING REF</div>
                  <div className="text-white font-bold tracking-widest">
                    SUBA-{Date.now().toString(36).toUpperCase()}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsRecording(false);
                  setRecordingTime(0);
                  setFormData({ subject: '', timestamp: '', caption: '' });
                }}
                className="text-white/40 hover:text-white text-sm"
              >
                [ NEW CAPTURE ]
              </button>
            </div>
          )}
        </div>
      </Html>
      
      {/* Screen reflection */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
        />
      </mesh>
      
      {/* LCD info bar */}
      <Text
        position={[0, -1.7, 0.1]}
        fontSize={0.08}
        color="#666666"
        anchorX="center"
      >
        SUBA STUDIOS • CAPTURE THE MOMENT
      </Text>
    </group>
  );
};

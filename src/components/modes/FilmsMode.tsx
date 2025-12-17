import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface Film {
  id: number;
  title: string;
  duration: string;
  year: string;
  color: string;
}

const FILMS: Film[] = [
  { id: 1, title: 'WHISPERS OF FOREVER', duration: '8:42', year: '2024', color: '#C9A227' },
  { id: 2, title: 'DAWN CEREMONY', duration: '12:15', year: '2024', color: '#8B4513' },
  { id: 3, title: 'SILK DREAMS', duration: '6:30', year: '2023', color: '#4A0E4E' },
  { id: 4, title: 'GOLDEN PROMISES', duration: '10:08', year: '2023', color: '#2C3E50' },
  { id: 5, title: 'ETERNAL FRAMES', duration: '15:22', year: '2023', color: '#1A5276' },
];

export const FilmsMode: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollRef = useRef(0);
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollVelocity(e.deltaY * 0.01);
      setScrollPosition((prev) => prev + e.deltaY * 0.002);
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  useFrame((state) => {
    // Decay velocity
    setScrollVelocity((v) => v * 0.95);
    
    if (!groupRef.current) return;
    
    // Apply motion blur effect based on velocity
    const blur = Math.abs(scrollVelocity) * 2;
    
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        // Simulate motion blur with opacity
        material.opacity = Math.max(0.3, 1 - blur * 0.3);
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {/* Timeline ribbon */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[30, 0.02]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      {/* Time markers */}
      {Array.from({ length: 21 }).map((_, i) => (
        <group key={i} position={[(i - 10) * 1.5 - scrollPosition * 5, 0, -1.9]}>
          <mesh>
            <boxGeometry args={[0.02, 0.2, 0.01]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.08}
            color="#444444"
            anchorX="center"
          >
            {`${i * 5}s`}
          </Text>
        </group>
      ))}
      
      {/* Film cards on timeline */}
      {FILMS.map((film, index) => {
        const xPos = index * 4 - scrollPosition * 5 - 8;
        const isVisible = Math.abs(xPos) < 8;
        
        return (
          <group key={film.id} position={[xPos, 0, 0]}>
            {/* Film thumbnail */}
            <mesh>
              <planeGeometry args={[3, 1.8]} />
              <meshStandardMaterial
                color={film.color}
                metalness={0.2}
                roughness={0.8}
                transparent
                opacity={isVisible ? 1 : 0.3}
              />
            </mesh>
            
            {/* Film strip perforations */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[-1.4, (i - 3.5) * 0.25, 0.01]}>
                <planeGeometry args={[0.08, 0.15]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[1.4, (i - 3.5) * 0.25, 0.01]}>
                <planeGeometry args={[0.08, 0.15]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            ))}
            
            {/* Play icon */}
            <mesh position={[0, 0, 0.1]}>
              <circleGeometry args={[0.3, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0.05, 0, 0.11]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.12, 0.2, 3]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            
            {/* Film info */}
            <Text
              position={[0, -1.2, 0]}
              fontSize={0.12}
              color="#ffffff"
              anchorX="center"
              letterSpacing={0.05}
            >
              {film.title}
            </Text>
            <Text
              position={[0, -1.45, 0]}
              fontSize={0.08}
              color="#666666"
              anchorX="center"
            >
              {film.duration} • {film.year}
            </Text>
          </group>
        );
      })}
      
      {/* Playhead */}
      <mesh position={[0, 0, -1.8]}>
        <boxGeometry args={[0.05, 2.5, 0.01]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Velocity indicator */}
      <Html position={[0, 2, 0]} center>
        <div className="font-mono text-white/50 text-xs">
          <div>SPEED: {Math.abs(scrollVelocity).toFixed(2)}x</div>
          <div className="mt-1 text-white/30">◀ SCRUB TIMELINE ▶</div>
        </div>
      </Html>
      
      {/* Motion blur overlay */}
      {Math.abs(scrollVelocity) > 0.1 && (
        <mesh position={[0, 0, 1]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={Math.min(Math.abs(scrollVelocity) * 0.1, 0.3)}
          />
        </mesh>
      )}
    </group>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';
import { useAudio } from '@/hooks/useAudio';
import gsap from 'gsap';

interface Project {
  id: number;
  title: string;
  category: string;
  color: string;
}

const PROJECTS: Project[] = [
  { id: 1, title: 'ETERNAL VOWS', category: 'Wedding', color: '#D4AF37' },
  { id: 2, title: 'MIDNIGHT BLOOM', category: 'Editorial', color: '#9B59B6' },
  { id: 3, title: 'GOLDEN HOUR', category: 'Portrait', color: '#E67E22' },
  { id: 4, title: 'URBAN ELEGANCE', category: 'Fashion', color: '#3498DB' },
  { id: 5, title: 'TIMELESS LOVE', category: 'Wedding', color: '#E74C3C' },
  { id: 6, title: 'SILK & SHADOWS', category: 'Editorial', color: '#1ABC9C' },
];

interface ProjectCardProps {
  project: Project;
  index: number;
  focusedIndex: number;
  onFocus: (index: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, focusedIndex, onFocus }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setFocused } = useCameraStore();
  const { playFocus } = useAudio();
  
  const isFocused = index === focusedIndex;
  const distance = Math.abs(index - focusedIndex);
  const blur = Math.min(distance * 0.3, 1);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const targetZ = isFocused ? 1 : -distance * 0.5;
    const targetScale = isFocused ? 1.2 : 1 - distance * 0.1;
    const targetOpacity = 1 - blur * 0.5;
    
    gsap.to(meshRef.current.position, {
      z: targetZ,
      duration: 0.5,
      ease: 'power2.out',
    });
    
    gsap.to(meshRef.current.scale, {
      x: targetScale,
      y: targetScale,
      duration: 0.5,
      ease: 'power2.out',
    });
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    gsap.to(material, {
      opacity: targetOpacity,
      duration: 0.3,
    });
  });
  
  useEffect(() => {
    if (isFocused) {
      playFocus();
      setFocused(true, project.title);
    }
  }, [isFocused, playFocus, setFocused, project.title]);
  
  return (
    <group position={[(index - 2.5) * 3, 0, 0]}>
      <mesh
        ref={meshRef}
        onClick={() => onFocus(index)}
        onPointerEnter={() => onFocus(index)}
      >
        <planeGeometry args={[2.5, 1.8]} />
        <meshStandardMaterial
          color={project.color}
          metalness={0.3}
          roughness={0.7}
          transparent
        />
      </mesh>
      
      {/* Project info */}
      <Text
        position={[0, -1.2, 0.1]}
        fontSize={0.15}
        color={isFocused ? '#ffffff' : '#666666'}
        anchorX="center"
        letterSpacing={0.1}
      >
        {project.title}
      </Text>
      <Text
        position={[0, -1.45, 0.1]}
        fontSize={0.08}
        color="#888888"
        anchorX="center"
        letterSpacing={0.2}
      >
        {project.category.toUpperCase()}
      </Text>
      
      {/* Focus indicator */}
      {isFocused && (
        <mesh position={[0, 0, 0.2]}>
          <ringGeometry args={[1.4, 1.45, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export const PortfolioMode: React.FC = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const { setFocused } = useCameraStore();
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      setFocusedIndex((prev) => 
        Math.max(0, Math.min(PROJECTS.length - 1, prev + direction))
      );
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    gsap.to(groupRef.current.position, {
      x: -focusedIndex * 3 + 7.5,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
  
  return (
    <group ref={groupRef}>
      {PROJECTS.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          focusedIndex={focusedIndex}
          onFocus={setFocusedIndex}
        />
      ))}
      
      {/* Focus ring visualization */}
      <Text
        position={[focusedIndex * 3 - 7.5, 2, 0]}
        fontSize={0.12}
        color="#00ff00"
        anchorX="center"
      >
        ● FOCUS LOCKED
      </Text>
      
      {/* Virtual focus ring indicator */}
      <Html position={[-8, -2.5, 0]} center>
        <div className="flex items-center gap-2 text-white/50 font-mono text-xs">
          <span>◀ SCROLL TO FOCUS ▶</span>
        </div>
      </Html>
    </group>
  );
};

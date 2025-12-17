import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useCameraStore } from '@/stores/cameraStore';

interface ServicePart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

const CAMERA_PARTS: ServicePart[] = [
  {
    id: 'lens',
    name: 'VISION & FRAMING',
    description: 'Cinematic composition and creative direction that tells your unique story.',
    position: [0, 0, 1.5],
    rotation: [Math.PI / 2, 0, 0],
    color: '#3498DB',
  },
  {
    id: 'sensor',
    name: 'CINEMATOGRAPHY',
    description: '8K capture with industry-leading dynamic range and color science.',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    color: '#9B59B6',
  },
  {
    id: 'shutter',
    name: 'TIMING & EMOTION',
    description: 'Capturing decisive moments with precision and artistic intuition.',
    position: [0, 0.8, 0],
    rotation: [0, 0, 0],
    color: '#E74C3C',
  },
  {
    id: 'flash',
    name: 'LIGHTING MASTERY',
    description: 'Professional lighting design for any environment or mood.',
    position: [0, 1.2, 0],
    rotation: [0, 0, 0],
    color: '#F39C12',
  },
  {
    id: 'storage',
    name: 'ALBUMS & DELIVERY',
    description: 'Premium physical albums and secure digital delivery.',
    position: [0.8, 0, 0],
    rotation: [0, 0, 0],
    color: '#1ABC9C',
  },
];

const CameraPart: React.FC<{
  part: ServicePart;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ part, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setFocused } = useCameraStore();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (isSelected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  
  const getGeometry = () => {
    switch (part.id) {
      case 'lens':
        return <cylinderGeometry args={[0.4, 0.35, 0.8, 32]} />;
      case 'sensor':
        return <boxGeometry args={[0.8, 0.6, 0.1]} />;
      case 'shutter':
        return <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />;
      case 'flash':
        return <boxGeometry args={[0.5, 0.3, 0.2]} />;
      case 'storage':
        return <boxGeometry args={[0.3, 0.4, 0.1]} />;
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    }
  };
  
  return (
    <Float
      speed={isSelected ? 2 : 0.5}
      rotationIntensity={isSelected ? 0.5 : 0.1}
      floatIntensity={isSelected ? 1 : 0.3}
    >
      <mesh
        ref={meshRef}
        position={isSelected ? [0, 0, 2] : part.position}
        rotation={part.rotation}
        onClick={onSelect}
        onPointerEnter={() => setFocused(true, part.name)}
        onPointerLeave={() => setFocused(false)}
        scale={isSelected ? 2 : 1}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={part.color}
          metalness={0.8}
          roughness={0.2}
          emissive={part.color}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>
    </Float>
  );
};

export const ServicesMode: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const selectedPartData = CAMERA_PARTS.find((p) => p.id === selectedPart);
  
  useFrame((state) => {
    if (!groupRef.current || selectedPart) return;
    
    // Gentle rotation when no part is selected
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });
  
  return (
    <group>
      {/* Exploded camera parts */}
      <group ref={groupRef}>
        {CAMERA_PARTS.map((part) => (
          <CameraPart
            key={part.id}
            part={part}
            isSelected={selectedPart === part.id}
            onSelect={() => setSelectedPart(selectedPart === part.id ? null : part.id)}
          />
        ))}
      </group>
      
      {/* Connection lines */}
      {!selectedPart && (
        <>
          {CAMERA_PARTS.slice(0, -1).map((part, i) => {
            const nextPart = CAMERA_PARTS[i + 1];
            return (
              <line key={part.id}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      ...part.position,
                      ...nextPart.position,
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#333333" transparent opacity={0.3} />
              </line>
            );
          })}
        </>
      )}
      
      {/* Selected part info */}
      {selectedPartData && (
        <Html position={[3, 0, 0]} center>
          <div className="w-64 bg-black/80 border border-white/20 p-4 font-mono">
            <div className="text-green-400 text-xs mb-2">◉ DIAGNOSTIC</div>
            <div className="text-white text-lg mb-2">{selectedPartData.name}</div>
            <div className="text-white/60 text-sm leading-relaxed">
              {selectedPartData.description}
            </div>
            <button
              onClick={() => setSelectedPart(null)}
              className="mt-4 text-xs text-white/40 hover:text-white transition-colors"
            >
              [ESC] CLOSE
            </button>
          </div>
        </Html>
      )}
      
      {/* Title */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.15}
        color="#666666"
        anchorX="center"
        letterSpacing={0.2}
      >
        {selectedPart ? 'COMPONENT ANALYSIS' : 'SELECT COMPONENT TO EXPLORE'}
      </Text>
    </group>
  );
};

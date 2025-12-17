import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';
import gsap from 'gsap';

interface FloatingFrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  index: number;
}

const FloatingFrame: React.FC<FloatingFrameProps> = ({ position, rotation, scale, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { cursorPosition, setFocused } = useCameraStore();
  const { size, camera } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Convert cursor to normalized device coordinates
    const ndcX = (cursorPosition.x / size.width) * 2 - 1;
    const ndcY = -(cursorPosition.y / size.height) * 2 + 1;
    
    // Create a vector for cursor position in 3D space
    const cursorVec = new THREE.Vector3(ndcX * 10, ndcY * 10, 0);
    
    // Apply gravitational force away from cursor
    const meshPos = meshRef.current.position;
    const direction = new THREE.Vector3().subVectors(meshPos, cursorVec);
    const distance = direction.length();
    
    if (distance < 5) {
      const force = (5 - distance) * 0.01;
      direction.normalize();
      meshPos.add(direction.multiplyScalar(force));
    }
    
    // Gentle floating animation
    meshPos.y += Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.001;
    meshRef.current.rotation.y += 0.001;
    meshRef.current.rotation.x += 0.0005;
  });
  
  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerEnter={() => setFocused(true, `Frame ${index + 1}`)}
        onPointerLeave={() => setFocused(false)}
      >
        <boxGeometry args={[1.6, 1, 0.02]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          emissive="#111111"
          emissiveIntensity={0.1}
        />
        
        {/* Photo surface */}
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[1.5, 0.9]} />
          <meshStandardMaterial
            color={`hsl(${(index * 37) % 360}, 30%, 20%)`}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      </mesh>
    </Float>
  );
};

const CameraObject: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const { cursorPosition } = useCameraStore();
  const { size } = useThree();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Subtle rotation following cursor
    const ndcX = (cursorPosition.x / size.width) * 2 - 1;
    const ndcY = -(cursorPosition.y / size.height) * 2 + 1;
    
    gsap.to(groupRef.current.rotation, {
      y: ndcX * 0.1,
      x: -ndcY * 0.05,
      duration: 1,
      ease: 'power2.out',
    });
    
    // Idle drift
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    groupRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
    
    // Lens glass animation
    if (lensRef.current) {
      (lensRef.current.material as THREE.MeshPhysicalMaterial).clearcoatRoughness = 
        0.1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Camera body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.4, 1]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Top plate */}
      <mesh position={[0, 0.8, -0.1]} castShadow>
        <boxGeometry args={[1.8, 0.2, 0.6]} />
        <meshStandardMaterial
          color="#0f0f0f"
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      
      {/* Pentaprism */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Lens mount */}
      <mesh position={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
      
      {/* Lens barrel */}
      <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.4, 0.7, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      
      {/* Focus ring */}
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#333333"
          metalness={0.7}
          roughness={0.5}
        />
      </mesh>
      
      {/* Lens glass */}
      <mesh ref={lensRef} position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshPhysicalMaterial
          color="#000022"
          metalness={0.1}
          roughness={0.05}
          transmission={0.6}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.5}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Lens reflections/coatings */}
      <mesh position={[0, 0, 1.31]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.35, 32]} />
        <meshStandardMaterial
          color="#4488ff"
          metalness={0.5}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Grip */}
      <mesh position={[0.95, -0.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.8]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
      
      {/* Hot shoe */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.95}
          roughness={0.2}
        />
      </mesh>
      
      {/* Shutter button */}
      <mesh position={[0.7, 0.9, 0.1]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial
          color="#333333"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Mode dial */}
      <mesh position={[-0.6, 0.9, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Volumetric light beam */}
      <mesh position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1, 3, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const HomeMode: React.FC = () => {
  const frames = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 0.5,
    }));
  }, []);
  
  return (
    <group>
      {/* Central camera */}
      <CameraObject />
      
      {/* Floating frames */}
      {frames.map((frame, i) => (
        <FloatingFrame
          key={i}
          position={frame.position}
          rotation={frame.rotation}
          scale={frame.scale}
          index={i}
        />
      ))}
      
      {/* Ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={500}
            array={new Float32Array(
              Array.from({ length: 500 * 3 }, () => (Math.random() - 0.5) * 30)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.02}
          transparent
          opacity={0.3}
          sizeAttenuation
        />
      </points>
      
      {/* Title text */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        letterSpacing={0.2}
      >
        SUBA STUDIOS
      </Text>
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.1}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.3}
      >
        CAMERA-OS v1.0
      </Text>
    </group>
  );
};

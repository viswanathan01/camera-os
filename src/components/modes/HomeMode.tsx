import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';
import { portfolioImages } from '@/data/portfolioContent';
import gsap from 'gsap';

// Safe zone margins (percentage)
const SAFE_MARGIN = 0.15;
const UI_EXCLUSION_ZONES = [
  { x: 0.85, y: 0.85, radius: 0.2 }, // Mode dial bottom-right
  { x: 0.08, y: 0.08, radius: 0.15 }, // Logo top-left
];

interface FloatingFrameProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  index: number;
  imageUrl: string;
  title: string;
  aspect: number;
}

const FloatingFrame: React.FC<FloatingFrameProps> = ({ 
  position, 
  rotation, 
  scale, 
  index, 
  imageUrl,
  title,
  aspect 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { cursorPosition, setFocused, currentMode } = useCameraStore();
  const { size, camera, viewport } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load texture
  const texture = useTexture(imageUrl);
  
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      setIsLoaded(true);
    }
  }, [texture]);
  
  // Calculate safe spawn position
  const safePosition = useMemo(() => {
    let [x, y, z] = position;
    const vw = viewport.width;
    const vh = viewport.height;
    
    // Clamp to safe zone
    const minX = -vw/2 * (1 - SAFE_MARGIN * 2);
    const maxX = vw/2 * (1 - SAFE_MARGIN * 2);
    const minY = -vh/2 * (1 - SAFE_MARGIN * 2);
    const maxY = vh/2 * (1 - SAFE_MARGIN * 2);
    
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    
    return [x, y, z] as [number, number, number];
  }, [position, viewport]);
  
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    const ndcX = (cursorPosition.x / size.width) * 2 - 1;
    const ndcY = -(cursorPosition.y / size.height) * 2 + 1;
    const cursorVec = new THREE.Vector3(ndcX * 8, ndcY * 6, 0);
    
    const meshPos = groupRef.current.position;
    const direction = new THREE.Vector3().subVectors(meshPos, cursorVec);
    const distance = direction.length();
    
    // Repulsion from cursor
    if (distance < 4 && !isHovered) {
      const force = (4 - distance) * 0.008;
      direction.normalize();
      meshPos.add(direction.multiplyScalar(force));
    }
    
    // UI exclusion zones repulsion
    UI_EXCLUSION_ZONES.forEach(zone => {
      const zoneX = (zone.x * 2 - 1) * viewport.width / 2;
      const zoneY = (zone.y * 2 - 1) * viewport.height / 2;
      const zoneVec = new THREE.Vector3(zoneX, -zoneY, 0);
      const toZone = new THREE.Vector3().subVectors(meshPos, zoneVec);
      const zoneDist = toZone.length();
      
      if (zoneDist < zone.radius * viewport.width) {
        const repulsion = (zone.radius * viewport.width - zoneDist) * 0.02;
        toZone.normalize();
        meshPos.add(toZone.multiplyScalar(repulsion));
      }
    });
    
    // Keep within safe bounds
    const vw = viewport.width;
    const vh = viewport.height;
    const margin = 0.8;
    meshPos.x = Math.max(-vw/2 * margin, Math.min(vw/2 * margin, meshPos.x));
    meshPos.y = Math.max(-vh/2 * margin, Math.min(vh/2 * margin, meshPos.y));
    
    // Gentle floating when not hovered
    if (!isHovered) {
      meshPos.y += Math.sin(state.clock.elapsedTime * 0.3 + index * 0.5) * 0.002;
      meshRef.current.rotation.y += 0.0008;
      meshRef.current.rotation.x += 0.0003;
    }
  });
  
  // Hover animation
  useEffect(() => {
    if (!groupRef.current || !meshRef.current || !materialRef.current) return;
    
    if (isHovered) {
      // Face camera and scale up
      gsap.to(meshRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(groupRef.current.scale, {
        x: 1.25,
        y: 1.25,
        z: 1.25,
        duration: 0.3,
        ease: 'back.out(1.5)',
      });
      gsap.to(materialRef.current, {
        emissiveIntensity: 0.3,
        duration: 0.3,
      });
    } else {
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(materialRef.current, {
        emissiveIntensity: 0,
        duration: 0.3,
      });
    }
  }, [isHovered]);
  
  const frameWidth = aspect >= 1 ? 1.6 : 1.2;
  const frameHeight = aspect >= 1 ? 1.0 : 1.6;
  
  return (
    <group ref={groupRef} position={safePosition}>
      <Float
        speed={isHovered ? 0 : 0.8}
        rotationIntensity={isHovered ? 0 : 0.15}
        floatIntensity={isHovered ? 0 : 0.3}
      >
        <mesh
          ref={meshRef}
          rotation={rotation}
          scale={scale}
          onPointerEnter={() => {
            setIsHovered(true);
            setFocused(true, title);
          }}
          onPointerLeave={() => {
            setIsHovered(false);
            setFocused(false);
          }}
          data-interactive
        >
          {/* Frame border */}
          <boxGeometry args={[frameWidth + 0.08, frameHeight + 0.08, 0.04]} />
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.2}
          />
          
          {/* Photo surface with actual image */}
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[frameWidth, frameHeight]} />
            <meshStandardMaterial
              ref={materialRef}
              map={texture}
              metalness={0.1}
              roughness={0.5}
              emissive="#ffffff"
              emissiveIntensity={0}
              transparent={!isLoaded}
              opacity={isLoaded ? 1 : 0}
            />
          </mesh>
          
          {/* Backlit glow when hovered */}
          {isHovered && (
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[frameWidth + 0.2, frameHeight + 0.2]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.1}
              />
            </mesh>
          )}
        </mesh>
      </Float>
    </group>
  );
};

const CameraObject: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const { cursorPosition, setFocused } = useCameraStore();
  const { size } = useThree();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const ndcX = (cursorPosition.x / size.width) * 2 - 1;
    const ndcY = -(cursorPosition.y / size.height) * 2 + 1;
    
    gsap.to(groupRef.current.rotation, {
      y: ndcX * 0.15,
      x: -ndcY * 0.08,
      duration: 0.8,
      ease: 'power2.out',
    });
    
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    groupRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.04;
    
    if (lensRef.current) {
      (lensRef.current.material as THREE.MeshPhysicalMaterial).clearcoatRoughness = 
        0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={[0, 0, 0]}
      onPointerEnter={() => setFocused(true, 'SUBA STUDIOS')}
      onPointerLeave={() => setFocused(false)}
    >
      {/* Camera body */}
      <mesh castShadow>
        <boxGeometry args={[2, 1.4, 1]} />
        <meshStandardMaterial
          color="#0f0f0f"
          metalness={0.95}
          roughness={0.25}
        />
      </mesh>
      
      {/* Top plate */}
      <mesh position={[0, 0.8, -0.1]} castShadow>
        <boxGeometry args={[1.8, 0.2, 0.6]} />
        <meshStandardMaterial color="#080808" metalness={0.97} roughness={0.15} />
      </mesh>
      
      {/* Pentaprism */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Lens mount */}
      <mesh position={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.98} roughness={0.1} />
      </mesh>
      
      {/* Lens barrel */}
      <mesh position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.38, 0.8, 32]} />
        <meshStandardMaterial color="#0c0c0c" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Focus ring with texture */}
      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.06, 8, 48]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.75} roughness={0.4} />
      </mesh>
      
      {/* Lens glass - premium feel */}
      <mesh ref={lensRef} position={[0, 0, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 64]} />
        <meshPhysicalMaterial
          color="#000011"
          metalness={0.05}
          roughness={0.02}
          transmission={0.7}
          thickness={0.6}
          clearcoat={1}
          clearcoatRoughness={0.08}
          ior={1.52}
          envMapIntensity={3}
        />
      </mesh>
      
      {/* Lens coatings - multiple layers */}
      <mesh position={[0, 0, 1.36]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.36, 64]} />
        <meshStandardMaterial
          color="#2244aa"
          metalness={0.4}
          roughness={0.05}
          transparent
          opacity={0.25}
        />
      </mesh>
      <mesh position={[0, 0, 1.365]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 64]} />
        <meshStandardMaterial
          color="#aa4422"
          metalness={0.4}
          roughness={0.05}
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Grip with texture */}
      <mesh position={[0.98, -0.15, 0]}>
        <boxGeometry args={[0.28, 1.05, 0.85]} />
        <meshStandardMaterial color="#050505" metalness={0.2} roughness={0.9} />
      </mesh>
      
      {/* Hot shoe */}
      <mesh position={[0, 1.04, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.98} roughness={0.12} />
      </mesh>
      
      {/* Shutter button */}
      <mesh position={[0.72, 0.92, 0.12]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshStandardMaterial color="#222222" metalness={0.85} roughness={0.25} />
      </mesh>
      
      {/* Mode dial */}
      <mesh position={[-0.62, 0.92, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.12, 24]} />
        <meshStandardMaterial color="#0f0f0f" metalness={0.92} roughness={0.18} />
      </mesh>
      
      {/* Volumetric light beam from lens */}
      <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.2, 4, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.015}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export const HomeMode: React.FC = () => {
  const frames = useMemo(() => {
    // Use actual portfolio images
    return portfolioImages.slice(0, 24).map((img, i) => {
      // Distribute in a more organized orbital pattern
      const angle = (i / 24) * Math.PI * 2;
      const radius = 4 + Math.random() * 4;
      const heightVariance = (Math.random() - 0.5) * 6;
      
      return {
        position: [
          Math.cos(angle) * radius,
          heightVariance,
          Math.sin(angle) * radius - 8,
        ] as [number, number, number],
        rotation: [
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI * 0.5,
          (Math.random() - 0.5) * 0.2,
        ] as [number, number, number],
        scale: 0.6 + Math.random() * 0.4,
        imageUrl: img.src,
        title: img.title,
        aspect: img.aspect,
      };
    });
  }, []);
  
  return (
    <group>
      {/* Central camera */}
      <CameraObject />
      
      {/* Floating photo frames with real images */}
      {frames.map((frame, i) => (
        <FloatingFrame
          key={i}
          position={frame.position}
          rotation={frame.rotation}
          scale={frame.scale}
          index={i}
          imageUrl={frame.imageUrl}
          title={frame.title}
          aspect={frame.aspect}
        />
      ))}
      
      {/* Ambient dust particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={new Float32Array(
              Array.from({ length: 300 * 3 }, () => (Math.random() - 0.5) * 25)
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.015}
          transparent
          opacity={0.25}
          sizeAttenuation
        />
      </points>
      
      {/* Studio name */}
      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.25}
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff"
      >
        SUBA STUDIOS
      </Text>
      <Text
        position={[0, -4.6, 0]}
        fontSize={0.12}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.35}
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff"
      >
        WHERE MOMENTS BECOME MONUMENTS
      </Text>
      <Text
        position={[0, -5.1, 0]}
        fontSize={0.08}
        color="#444444"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.4}
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff"
      >
        CAMERA-OS v1.0 • ROTATE DIAL TO EXPLORE
      </Text>
    </group>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  framesShot: string;
  focalLength: string;
  philosophy: string;
}

const TEAM: TeamMember[] = [
  {
    id: 1,
    name: 'ALEX CHEN',
    role: 'Lead Cinematographer',
    framesShot: '2.4M',
    focalLength: '35mm',
    philosophy: 'Light is the language of emotion',
  },
  {
    id: 2,
    name: 'MAYA PATEL',
    role: 'Creative Director',
    framesShot: '1.8M',
    focalLength: '50mm',
    philosophy: 'Every frame tells a story',
  },
  {
    id: 3,
    name: 'JAMES WRIGHT',
    role: 'Editor',
    framesShot: '890K',
    focalLength: '85mm',
    philosophy: 'Rhythm creates emotion',
  },
];

const DevelopingPhoto: React.FC<{
  position: [number, number, number];
  member: TeamMember;
  index: number;
}> = ({ position, member, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const { cursorPosition } = useCameraStore();
  const { size } = useThree();
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Check if cursor is over this photo
    const ndcX = (cursorPosition.x / size.width) * 2 - 1;
    const ndcY = -(cursorPosition.y / size.height) * 2 + 1;
    
    const meshPos = meshRef.current.position;
    const distance = Math.sqrt(
      Math.pow((ndcX * 5) - meshPos.x, 2) +
      Math.pow((ndcY * 3) - meshPos.y, 2)
    );
    
    // Reveal based on cursor proximity (developer fluid effect)
    if (distance < 2) {
      setRevealProgress((prev) => Math.min(1, prev + 0.02));
    }
  });
  
  return (
    <group position={position}>
      {/* Photo paper */}
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 2.5]} />
        <meshStandardMaterial
          color={`rgb(${Math.floor(255 * revealProgress)}, ${Math.floor(200 * revealProgress)}, ${Math.floor(180 * revealProgress)})`}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Developing image overlay */}
      <mesh position={[0, 0.3, 0.01]}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshBasicMaterial
          color="#2a2a2a"
          transparent
          opacity={1 - revealProgress}
        />
      </mesh>
      
      {/* Revealed content */}
      {revealProgress > 0.3 && (
        <>
          <Text
            position={[0, -0.7, 0.02]}
            fontSize={0.12}
            color={`rgba(255,255,255,${revealProgress})`}
            anchorX="center"
          >
            {member.name}
          </Text>
          <Text
            position={[0, -0.9, 0.02]}
            fontSize={0.08}
            color={`rgba(150,150,150,${revealProgress})`}
            anchorX="center"
          >
            {member.role}
          </Text>
        </>
      )}
      
      {revealProgress > 0.6 && (
        <Html position={[0, -1.2, 0]} center>
          <div
            className="text-center font-mono text-xs space-y-1"
            style={{ opacity: revealProgress }}
          >
            <div className="text-red-400">◉ {member.framesShot} FRAMES</div>
            <div className="text-white/50">ƒ {member.focalLength}</div>
            <div className="text-white/30 text-[10px] max-w-32 italic">
              "{member.philosophy}"
            </div>
          </div>
        </Html>
      )}
      
      {/* Clip/pin at top */}
      <mesh position={[0, 1.35, 0.1]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const AboutMode: React.FC = () => {
  return (
    <group>
      {/* Red safelight ambiance handled by scene lighting */}
      
      {/* Developing photos */}
      {TEAM.map((member, index) => (
        <DevelopingPhoto
          key={member.id}
          position={[(index - 1) * 3, 0, 0]}
          member={member}
          index={index}
        />
      ))}
      
      {/* Clothesline */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-5, 1.5, 0, 5, 1.5, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333333" />
      </line>
      
      {/* Development trays */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={i} position={[x, -2.5, 0]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
      
      {/* Instructions */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.1}
        color="#ff0000"
        anchorX="center"
        letterSpacing={0.2}
      >
        MOVE CURSOR TO DEVELOP
      </Text>
      
      {/* Chemical bottles */}
      {[-4, 4].map((x, i) => (
        <mesh key={i} position={[x, -2, 1]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
          <meshStandardMaterial color={i === 0 ? '#4a1a1a' : '#1a1a4a'} />
        </mesh>
      ))}
    </group>
  );
};

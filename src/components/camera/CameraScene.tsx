import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/cameraStore';
import { HomeMode } from '@/components/modes/HomeMode';
import { PortfolioMode } from '@/components/modes/PortfolioMode';
import { FilmsMode } from '@/components/modes/FilmsMode';
import { ServicesMode } from '@/components/modes/ServicesMode';
import { AboutMode } from '@/components/modes/AboutMode';
import { ContactMode } from '@/components/modes/ContactMode';

const SceneLighting: React.FC = () => {
  const { currentMode } = useCameraStore();
  
  // Darkroom red light for About mode
  const isAboutMode = currentMode === 'ISO';
  
  return (
    <>
      <ambientLight intensity={isAboutMode ? 0.1 : 0.3} color={isAboutMode ? '#ff0000' : '#ffffff'} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isAboutMode ? 0.2 : 1}
        color={isAboutMode ? '#ff2200' : '#ffffff'}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />
      <pointLight position={[10, -10, 10]} intensity={0.3} color="#ff8844" />
      
      {isAboutMode && (
        <>
          <pointLight position={[0, 3, 2]} intensity={0.5} color="#ff0000" />
          <pointLight position={[-3, 2, 2]} intensity={0.3} color="#ff0000" />
          <pointLight position={[3, 2, 2]} intensity={0.3} color="#ff0000" />
        </>
      )}
    </>
  );
};

const ModeRenderer: React.FC = () => {
  const { currentMode, isTransitioning } = useCameraStore();
  
  if (isTransitioning) return null;
  
  switch (currentMode) {
    case 'M':
      return <HomeMode />;
    case 'Av':
      return <PortfolioMode />;
    case 'Tv':
      return <FilmsMode />;
    case 'P':
      return <ServicesMode />;
    case 'ISO':
      return <AboutMode />;
    case 'REC':
      return <ContactMode />;
    default:
      return <HomeMode />;
  }
};

const PostProcessing: React.FC = () => {
  const { currentMode } = useCameraStore();
  
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
      />
      <Vignette
        offset={0.3}
        darkness={currentMode === 'ISO' ? 0.8 : 0.5}
        blendFunction={BlendFunction.NORMAL}
      />
      {/* Chromatic aberration removed due to type incompatibility */}
      <Noise
        opacity={0.02}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
};

export const CameraScene: React.FC = () => {
  const { currentMode } = useCameraStore();
  
  return (
    <Canvas
      className="w-full h-full"
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      shadows
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000000']} />
      
      <PerformanceMonitor>
        <Suspense fallback={null}>
          <SceneLighting />
          
          {/* Stars for depth in home mode */}
          {currentMode === 'M' && (
            <Stars
              radius={100}
              depth={50}
              count={2000}
              factor={4}
              saturation={0}
              fade
              speed={0.5}
            />
          )}
          
          {/* Environment for reflections */}
          <Environment preset="night" />
          
          {/* Mode content */}
          <ModeRenderer />
          
          {/* Post-processing effects */}
          <PostProcessing />
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  );
};

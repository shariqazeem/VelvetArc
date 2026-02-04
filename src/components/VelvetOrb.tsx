"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Environment,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import { useAgentAPI } from "@/hooks/useAgentAPI";

type Volatility = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

interface OrbConfig {
  coreColor: string;
  emissive: string;
  emissiveIntensity: number;
  speed: number;
  pulseIntensity: number;
  particleColor: string;
  particleOpacity: number;
  particleSpeed: number;
}

// Get visual config based on volatility and vaultState
function getOrbConfig(volatility: Volatility, vaultState: number): OrbConfig {
  // VaultState: 0=IDLE, 1=BRIDGING_OUT, 2=DEPLOYED, 3=BRIDGING_BACK, 4=PROTECTED

  // If IDLE (0) or PROTECTED (4) vault state, show safe silver/white
  if (vaultState === 0 || vaultState === 4) {
    return {
      coreColor: "#e2e8f0",      // Soft silver
      emissive: "#94a3b8",       // Slate gray glow
      emissiveIntensity: 0.4,
      speed: 0.4,
      pulseIntensity: 0.02,
      particleColor: "#cbd5e1",
      particleOpacity: 0.2,
      particleSpeed: 0.05,
    };
  }

  // Otherwise, color based on volatility
  switch (volatility) {
    case "LOW":
      // Green glow - calm, earning yield
      return {
        coreColor: "#4ade80",      // Green
        emissive: "#22c55e",       // Bright green
        emissiveIntensity: 0.6,
        speed: 0.6,
        pulseIntensity: 0.025,
        particleColor: "#86efac",
        particleOpacity: 0.4,
        particleSpeed: 0.1,
      };

    case "MEDIUM":
      // Blue - balanced, normal operation
      return {
        coreColor: "#60a5fa",      // Blue
        emissive: "#3b82f6",       // Bright blue
        emissiveIntensity: 0.65,
        speed: 1.0,
        pulseIntensity: 0.03,
        particleColor: "#93c5fd",
        particleOpacity: 0.5,
        particleSpeed: 0.15,
      };

    case "HIGH":
      // Purple/red pulse - high volatility, capturing premium
      return {
        coreColor: "#c084fc",      // Purple
        emissive: "#a855f7",       // Bright purple
        emissiveIntensity: 0.8,
        speed: 2.0,
        pulseIntensity: 0.05,
        particleColor: "#e879f9",
        particleOpacity: 0.6,
        particleSpeed: 0.3,
      };

    case "EXTREME":
      // Red pulse - circuit breaker, emergency
      return {
        coreColor: "#f87171",      // Red
        emissive: "#ef4444",       // Bright red
        emissiveIntensity: 1.0,
        speed: 3.0,
        pulseIntensity: 0.08,
        particleColor: "#fca5a5",
        particleOpacity: 0.7,
        particleSpeed: 0.5,
      };

    default:
      // Fallback to silver
      return {
        coreColor: "#e2e8f0",
        emissive: "#94a3b8",
        emissiveIntensity: 0.4,
        speed: 0.4,
        pulseIntensity: 0.02,
        particleColor: "#cbd5e1",
        particleOpacity: 0.2,
        particleSpeed: 0.05,
      };
  }
}

// Inner liquid mercury core
function MercuryCore({ config }: { config: OrbConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.elapsedTime * config.speed;

      // Organic rotation
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;

      // Breathing scale with pulse intensity
      const breath = 1 + Math.sin(time * 0.5) * config.pulseIntensity;
      meshRef.current.scale.setScalar(breath);
    }

    // Animate emissive intensity for pulse effect
    if (materialRef.current) {
      const time = clock.elapsedTime * config.speed;
      const pulse = config.emissiveIntensity + Math.sin(time * 2) * 0.2;
      materialRef.current.emissiveIntensity = Math.max(0.2, pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.85, 128, 128]} />
      <meshStandardMaterial
        ref={materialRef}
        color={config.coreColor}
        emissive={config.emissive}
        emissiveIntensity={config.emissiveIntensity}
        metalness={1}
        roughness={0.1}
        envMapIntensity={2}
      />
    </mesh>
  );
}

// Outer glass shell with transmission
function GlassShell({ config }: { config: OrbConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={512}
        transmission={0.95}
        roughness={0.0}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.0}
        distortionScale={0.3}
        temporalDistortion={0.0}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#ffffff"
      />
    </mesh>
  );
}

// Ambient particles for depth - color matches volatility state
function AmbientParticles({ config }: { config: OrbConfig }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * config.particleSpeed;
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={config.particleColor}
        transparent
        opacity={config.particleOpacity}
        sizeAttenuation
      />
    </points>
  );
}

// Subtle camera movement
function CameraController() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    camera.position.x = Math.sin(time * 0.1) * 0.3;
    camera.position.y = Math.cos(time * 0.08) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main orb composition
function OrbScene({ config }: { config: OrbConfig }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const breath = 1 + Math.sin(clock.elapsedTime * 0.4) * 0.015;
      groupRef.current.scale.setScalar(breath);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#4060ff" />

      {/* The Orb */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={groupRef}>
          <MercuryCore config={config} />
          <GlassShell config={config} />
        </group>
      </Float>

      {/* Ambient particles */}
      <AmbientParticles config={config} />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Camera animation */}
      <CameraController />
    </>
  );
}

export function VelvetOrb() {
  const { state } = useAgentAPI();

  // Get real volatility and vaultState from agent API
  const volatility = state.volatility || "LOW";
  const vaultState = state.vaultState || 0;

  // Compute orb visual config based on real data
  const config = useMemo(() => {
    return getOrbConfig(volatility, vaultState);
  }, [volatility, vaultState]);

  return (
    <div className="orb-container">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        style={{ background: "#000000" }}
      >
        <OrbScene config={config} />
      </Canvas>
    </div>
  );
}

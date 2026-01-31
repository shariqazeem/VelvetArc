"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshTransmissionMaterial,
  Environment,
  Float,
  Sphere,
} from "@react-three/drei";
import * as THREE from "three";
import { useVelvetStore } from "@/hooks/useVelvetStore";

// Inner liquid mercury core
function MercuryCore({ state }: { state: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // State-based properties
  const config = useMemo(() => {
    switch (state) {
      case 1: // BRIDGING_OUT
      case 3: // BRIDGING_BACK
        return { color: "#a78bfa", emissive: "#6d28d9", speed: 2, distort: 0.4 };
      case 2: // DEPLOYED
        return { color: "#fb923c", emissive: "#c2410c", speed: 1.2, distort: 0.3 };
      case 4: // PROTECTED
        return { color: "#374151", emissive: "#111827", speed: 0.3, distort: 0.1 };
      default: // IDLE
        return { color: "#60a5fa", emissive: "#1e40af", speed: 0.6, distort: 0.2 };
    }
  }, [state]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Organic morphing
      const time = clock.elapsedTime * config.speed;
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;

      // Breathing scale
      const breath = 1 + Math.sin(time * 0.5) * 0.02;
      meshRef.current.scale.setScalar(breath);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.85, 128, 128]} />
      <meshStandardMaterial
        ref={materialRef}
        color={config.color}
        emissive={config.emissive}
        emissiveIntensity={0.5}
        metalness={1}
        roughness={0.1}
        envMapIntensity={2}
      />
    </mesh>
  );
}

// Outer glass shell with transmission
function GlassShell() {
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

// Ambient particles for depth
function AmbientParticles({ state }: { state: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute in a shell around the orb
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const isBridging = state === 1 || state === 3;

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const speed = isBridging ? 0.3 : 0.05;
      pointsRef.current.rotation.y = clock.elapsedTime * speed;
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
        color="#ffffff"
        transparent
        opacity={isBridging ? 0.6 : 0.15}
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
function OrbScene({ state }: { state: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Global breathing animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const breath = 1 + Math.sin(clock.elapsedTime * 0.4) * 0.015;
      groupRef.current.scale.setScalar(breath);
    }
  });

  return (
    <>
      {/* Lighting - minimal, let the orb glow */}
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} color="#4060ff" />

      {/* The Orb */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={groupRef}>
          <MercuryCore state={state} />
          <GlassShell />
        </group>
      </Float>

      {/* Ambient particles */}
      <AmbientParticles state={state} />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Camera animation */}
      <CameraController />
    </>
  );
}

export function VelvetOrb() {
  const vaultState = useVelvetStore((s) => s.vaultState);

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
        <OrbScene state={vaultState} />
      </Canvas>
    </div>
  );
}

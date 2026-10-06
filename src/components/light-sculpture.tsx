"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useRef, useState } from "react";
import type { Group } from "three";
function Ribbons() {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += Math.min(delta, 0.04) * 0.09;
      group.current.rotation.z =
        -0.55 + Math.sin(state.clock.elapsedTime * 0.18) * 0.1;
    }
  });
  return (
    <group ref={group} rotation={[0.5, 0.3, -0.55]}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          rotation={[i * 0.09, i * 0.19, i * 0.12]}
          scale={[1, 1.65, 1]}
        >
          <torusGeometry args={[1.45 + i * 0.045, 0.008 + i * 0.003, 8, 120]} />
          <meshStandardMaterial
            color={i % 2 ? "#e7d3a8" : "#ad8450"}
            metalness={0.75}
            roughness={0.27}
          />
        </mesh>
      ))}
    </group>
  );
}
export default function LightSculpture({ active }: { active: boolean }) {
  const [quality, setQuality] = useState(1.5);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, quality]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 4, 5]} intensity={4} />
      <Ribbons />
      {active && (
        <PerformanceMonitor
          bounds={() => [35, 55]}
          onDecline={() => setQuality(1)}
          flipflops={2}
          onFallback={() => setQuality(1)}
        />
      )}
    </Canvas>
  );
}

"use client";

import { PerformanceMonitor, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { MathUtils, SRGBColorSpace, type Group } from "three";

function Carousel({ images, active }: { images: string[]; active: number }) {
  const group = useRef<Group>(null);
  const textures = useTexture(images);
  const step = (Math.PI * 2) / images.length;

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      -active * step,
      4.5,
      delta,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.035;
  });

  return (
    <group ref={group}>
      {textures.map((texture, index) => {
        const angle = index * step;
        return (
          <group
            key={images[index]}
            position={[Math.sin(angle) * 4.25, 0, Math.cos(angle) * 4.25]}
            rotation={[0, angle, 0]}
          >
            <mesh position={[0, 0, -0.035]}>
              <planeGeometry args={[2.32, 3.12]} />
              <meshBasicMaterial color="#cbb17f" />
            </mesh>
            <mesh>
              <planeGeometry args={[2.24, 3.04]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function HairstyleShowcaseScene({
  images,
  active,
  running,
}: {
  images: string[];
  active: number;
  running: boolean;
}) {
  const [quality, setQuality] = useState(1.5);
  return (
    <Canvas
      frameloop={running ? "always" : "demand"}
      dpr={[1, quality]}
      camera={{ position: [0, 0, 7.35], fov: 43 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
    >
      <Carousel images={images} active={active} />
      {running && (
        <PerformanceMonitor
          bounds={() => [35, 55]}
          onDecline={() => setQuality(1)}
          onFallback={() => setQuality(1)}
          flipflops={2}
        />
      )}
    </Canvas>
  );
}

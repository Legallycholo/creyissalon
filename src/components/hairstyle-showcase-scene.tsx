"use client";

import { PerformanceMonitor, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MathUtils,
  SRGBColorSpace,
  type Group,
  type MeshBasicMaterial,
  type Texture,
} from "three";

type ProgressRef = { current: number };

const layouts = [
  [-0.15, 0.05, -0.02],
  [-2.65, 1.25, 0.08],
  [2.75, -1.15, -0.07],
  [1.9, 1.45, 0.04],
  [-2.4, -1.35, -0.06],
  [0.45, -0.2, 0.03],
  [-2.9, 0.25, 0.07],
  [2.7, 0.85, -0.05],
  [-1.25, -1.5, 0.04],
  [1.45, 1.2, -0.04],
] as const;

function dimensions(texture: Texture, index: number) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const ratio = image?.width && image?.height ? image.width / image.height : 0.76;
  const height = index % 3 === 0 ? 3.25 : index % 3 === 1 ? 2.45 : 2.85;
  return [MathUtils.clamp(height * ratio, 1.45, 3.7), height] as const;
}

function Photograph({
  texture,
  index,
  count,
  progress,
}: {
  texture: Texture;
  index: number;
  count: number;
  progress: ProgressRef;
}) {
  const group = useRef<Group>(null);
  const photo = useRef<MeshBasicMaterial>(null);
  const border = useRef<MeshBasicMaterial>(null);
  const [width, height] = useMemo(() => dimensions(texture, index), [texture, index]);
  const [layoutX, layoutY, layoutRotation] = layouts[index % layouts.length];

  useFrame((state, delta) => {
    if (!group.current || !photo.current || !border.current) return;
    const travelled = progress.current * (count - 1);
    const relative = index - travelled;
    const drift = Math.sin(state.clock.elapsedTime * 0.22 + index) * 0.08;
    const z = 2.85 - relative * 2.75;
    const x = layoutX + Math.sin(travelled * 0.42 + index * 0.7) * 0.18;
    const y = layoutY + drift;
    const opacity = MathUtils.clamp(
      Math.min((z + 8.5) / 2.5, (7.25 - z) / 1.4),
      0,
      1,
    );

    group.current.visible = opacity > 0.015;
    group.current.position.x = MathUtils.damp(group.current.position.x, x, 5, delta);
    group.current.position.y = MathUtils.damp(group.current.position.y, y, 5, delta);
    group.current.position.z = MathUtils.damp(group.current.position.z, z, 5, delta);
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      -layoutY * 0.025,
      4,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      -layoutX * 0.035,
      4,
      delta,
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      layoutRotation,
      4,
      delta,
    );
    photo.current.opacity = opacity;
    border.current.opacity = opacity * 0.78;
  });

  const initialZ = 2.85 - index * 2.75;
  return (
    <group ref={group} position={[layoutX, layoutY, initialZ]}>
      <mesh position={[0, 0, -0.035]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshBasicMaterial
          ref={border}
          color="#d6bd90"
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={photo}
          map={texture}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Gallery({ images, progress }: { images: string[]; progress: ProgressRef }) {
  const textures = useTexture(images);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  return (
    <group>
      {textures.map((texture, index) => (
        <Photograph
          key={images[index]}
          texture={texture}
          index={index}
          count={textures.length}
          progress={progress}
        />
      ))}
    </group>
  );
}

export default function HairstyleShowcaseScene({
  images,
  progress,
  running,
}: {
  images: string[];
  progress: ProgressRef;
  running: boolean;
}) {
  const [quality, setQuality] = useState(1.35);
  return (
    <Canvas
      frameloop={running ? "always" : "demand"}
      dpr={[1, quality]}
      camera={{ position: [0, 0, 8.6], fov: 44 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
    >
      <fog attach="fog" args={["#191b18", 8, 19]} />
      <Gallery images={images} progress={progress} />
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

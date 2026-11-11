"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ShelfItem } from "./items";
import { drawBand, drawCover, drawPegboard, drawSpine } from "./covers";

const CASE = { w: 0.5, h: 0.72, d: 0.1, gap: 0.1 };
const SPINE_COLORS = ["#2b2b2e", "#c2481a", "#e9e9e6", "#3d3a33", "#18181b", "#6b6b66", "#ff5b1f", "#26262a"];
const SPINE_WORDS = ["Launch", "Build", "Rank", "Convert", "Archive", "Studio", "Design", "Ship"];

function toTexture(cv: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

const k = (dt: number, speed = 10) => 1 - Math.exp(-speed * dt);

function Case({
  item,
  map,
  x,
  hovered,
  onHover,
  onSelect,
}: {
  item: ShelfItem;
  map: THREE.Texture;
  x: number;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (item: ShelfItem) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.position.z += ((hovered ? 0.34 : 0) - g.position.z) * k(dt);
    g.position.y += ((hovered ? 0.06 : 0) - g.position.y) * k(dt);
    g.rotation.x += ((hovered ? -0.06 : 0) - g.rotation.x) * k(dt);
  });
  return (
    <group ref={ref} position={[x, 0, 0]}>
      <mesh
        position={[0, CASE.h / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(item.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item);
        }}
      >
        <boxGeometry args={[CASE.w, CASE.h, CASE.d]} />
        <meshStandardMaterial attach="material-0" color="#111113" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#111113" roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#1a1a1c" roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#1a1a1c" roughness={0.6} />
        <meshStandardMaterial
          attach="material-4"
          map={map}
          roughness={0.38}
          metalness={0.05}
          emissive="#ffffff"
          emissiveMap={map}
          emissiveIntensity={hovered ? 0.22 : 0.06}
        />
        <meshStandardMaterial attach="material-5" color="#111113" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Spines({ textures, startX, count, dir, y }: { textures: THREE.Texture[]; startX: number; count: number; dir: 1 | -1; y: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const w = 0.075 + ((i * 37) % 3) * 0.012;
        const h = CASE.h * (0.86 + ((i * 53) % 5) * 0.03);
        const x = startX + dir * (i * 0.1 + w / 2);
        return (
          <mesh key={i} position={[x, y + h / 2, -0.12]}>
            <boxGeometry args={[w, h, 0.5]} />
            <meshStandardMaterial attach="material-0" color="#151517" />
            <meshStandardMaterial attach="material-1" color="#151517" />
            <meshStandardMaterial attach="material-2" color="#151517" />
            <meshStandardMaterial attach="material-3" color="#151517" />
            <meshStandardMaterial attach="material-4" map={textures[i % textures.length]} roughness={0.5} />
            <meshStandardMaterial attach="material-5" color="#151517" />
          </mesh>
        );
      })}
    </>
  );
}

function Rig({ span }: { span: number }) {
  const { camera, size, pointer } = useThree();
  const fovV = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
  const aspect = size.width / size.height;
  // Distance that fits the shelf on wide screens, capped so phones stay close and pan instead.
  const fitZ = span / 2 / (Math.tan(fovV / 2) * aspect);
  const z = THREE.MathUtils.clamp(fitZ + 0.15, 2.4, 4.6);
  const visibleW = 2 * Math.tan(fovV / 2) * z * aspect;
  const maxPan = Math.max(0, (span - visibleW) / 2 + 0.2);
  const idle = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const moved = Math.abs(pointer.x - last.current.x) + Math.abs(pointer.y - last.current.y) > 0.001;
    last.current = { x: pointer.x, y: pointer.y };
    idle.current = moved ? 0 : idle.current + dt;
    const drift = maxPan > 0 && idle.current > 2.5 ? Math.sin(state.clock.elapsedTime * 0.18) : pointer.x;
    const tx = drift * maxPan;
    camera.position.x += (tx - camera.position.x) * k(dt, 3);
    camera.position.y += (0.5 + pointer.y * 0.12 - camera.position.y) * k(dt, 3);
    camera.position.z = z;
    camera.lookAt(camera.position.x * 0.85 + pointer.x * 0.25, 0.4, 0);
  });
  return null;
}

function Flicker() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    const t = state.clock.elapsedTime;
    const off = Math.sin(t * 13) > 0.97 && Math.sin(t * 0.7) > 0.6;
    light.current.intensity = off ? 2 : 9;
  });
  return <pointLight ref={light} position={[0, 1.7, 1.2]} intensity={9} distance={7} decay={1.6} color="#f2f4ff" />;
}

function Scene({ items, onHover, hovered, onSelect, onReady }: SceneProps & { hovered: string | null }) {
  const [tex, setTex] = useState<{ covers: THREE.Texture[]; spines: THREE.Texture[]; peg: THREE.Texture; band: THREE.Texture } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.ready;
      const covers = await Promise.all(items.map(async (it) => toTexture(await drawCover(it))));
      const spines = SPINE_COLORS.map((c, i) => toTexture(drawSpine(SPINE_WORDS[i], c, c === "#e9e9e6" || c === "#ff5b1f")));
      const result = { covers, spines, peg: toTexture(drawPegboard(), [14, 6]), band: toTexture(drawBand()) };
      if (alive) {
        setTex(result);
        requestAnimationFrame(() => onReady());
      }
    })();
    return () => {
      alive = false;
    };
  }, [items, onReady]);

  const span = items.length * (CASE.w + CASE.gap) - CASE.gap;
  const xs = useMemo(() => items.map((_, i) => -span / 2 + CASE.w / 2 + i * (CASE.w + CASE.gap)), [items, span]);
  const shelfW = span + 2.6;

  if (!tex) return null;

  return (
    <>
      <color attach="background" args={["#0b0b0c"]} />
      <fog attach="fog" args={["#0b0b0c", 5, 11]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[1.5, 3, 4]} intensity={1.1} />
      <pointLight position={[-span / 2 - 0.8, 0.8, 1]} intensity={3} color="#ff5b1f" distance={4} />
      <Flicker />
      <Rig span={span + 0.5} />

      {/* Back wall */}
      <mesh position={[0, 0.2, -0.42]}>
        <planeGeometry args={[shelfW + 6, 5]} />
        <meshStandardMaterial map={tex.peg} roughness={0.9} />
      </mesh>
      {/* Header band */}
      <mesh position={[0, 1.18, -0.38]}>
        <planeGeometry args={[shelfW, shelfW * (160 / 2048)]} />
        <meshStandardMaterial map={tex.band} emissive="#ffffff" emissiveMap={tex.band} emissiveIntensity={0.18} />
      </mesh>
      {/* Fluorescent tube */}
      <mesh position={[0, 1.75, 0.9]}>
        <boxGeometry args={[2.6, 0.04, 0.3]} />
        <meshBasicMaterial color="#f4f6ff" />
      </mesh>

      {/* Shelves */}
      {[0, -0.92].map((y) => (
        <group key={y}>
          <mesh position={[0, y - 0.025, -0.05]}>
            <boxGeometry args={[shelfW, 0.05, 0.75]} />
            <meshStandardMaterial color="#1c1c1f" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, y - 0.07, 0.33]}>
            <boxGeometry args={[shelfW, 0.06, 0.02]} />
            <meshStandardMaterial color="#c2481a" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {items.map((it, i) => (
        <Case key={it.id} item={it} map={tex.covers[i]} x={xs[i]} hovered={hovered === it.id} onHover={onHover} onSelect={onSelect} />
      ))}
      <Spines textures={tex.spines} startX={-span / 2 - 0.12} count={12} dir={-1} y={0} />
      <Spines textures={tex.spines} startX={span / 2 + 0.12} count={12} dir={1} y={0} />
      <Spines textures={tex.spines} startX={-shelfW / 2 + 0.1} count={Math.floor(shelfW / 0.1) - 2} dir={1} y={-0.92} />
    </>
  );
}

type SceneProps = {
  items: ShelfItem[];
  onHover: (id: string | null) => void;
  onSelect: (item: ShelfItem) => void;
  onReady: () => void;
};

export default function ShelfScene({ active, hovered, ...props }: SceneProps & { active: boolean; hovered: string | null }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 38, position: [0, 0.45, 4.4], near: 0.1, far: 30 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onHover(null)}
      style={{ touchAction: "pan-y" }}
      aria-hidden
    >
      <Scene {...props} hovered={hovered} />
    </Canvas>
  );
}

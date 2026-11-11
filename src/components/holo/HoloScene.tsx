"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ShelfItem } from "@/components/shelf/items";
import { COVER, drawBack, drawCover } from "@/components/shelf/covers";
import { coverFragment, coverVertex, emberFragment, emberVertex } from "./shaders";

export type HoloMode = "enter" | "idle" | "open" | "launch";

const W = 1.62;
const H = W * (COVER.h / COVER.w);
const D = 0.2;

type Pointer = { x: number; y: number };
type Shared = {
  pointer: React.RefObject<Pointer>;
  yaw: React.RefObject<{ value: number; vel: number; dragging: boolean }>;
};

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);
const damp = (dt: number, s: number) => 1 - Math.exp(-s * dt);

function toTex(cv: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function makeCoverMaterial(map: THREE.Texture, foil: number) {
  return new THREE.ShaderMaterial({
    toneMapped: false, // keep printed colours true; the foil is the only thing that should shift
    vertexShader: coverVertex,
    fragmentShader: coverFragment,
    uniforms: {
      uMap: { value: map },
      uTime: { value: 0 },
      uFoil: { value: foil },
      uFire: { value: 1 },
      uGlare: { value: 1 },
      uLight: { value: new THREE.Vector3(0, 0, 3) },
      uFireCol: { value: new THREE.Color("#ff5b1f") },
    },
  });
}

function Embers() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const geo = useMemo(() => {
    const n = 260;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      pos[i * 3 + 2] = -2.4 + Math.random() * 2.6;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixel: { value: 1 }, uColor: { value: new THREE.Color("#ff6a2b") } }),
    [],
  );
  useFrame((s) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = s.clock.elapsedTime;
    mat.current.uniforms.uPixel.value = s.gl.getPixelRatio() * Math.min(viewport.width / 6, 1.4);
  });
  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={mat}
        vertexShader={emberVertex}
        fragmentShader={emberFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Case({
  item,
  mode,
  shared,
  onReady,
  onCaseClick,
  narrow,
}: {
  item: ShelfItem;
  mode: HoloMode;
  shared: Shared;
  onReady: () => void;
  onCaseClick: () => void;
  narrow: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [mats, setMats] = useState<{ front: THREE.ShaderMaterial; back: THREE.ShaderMaterial } | null>(null);
  const modeStart = useRef(0);
  const down = useRef<{ x: number; y: number } | null>(null);
  const clock = useThree((s) => s.clock);

  useEffect(() => {
    modeStart.current = clock.elapsedTime;
  }, [mode, clock]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await document.fonts.ready;
      const front = makeCoverMaterial(toTex(await drawCover(item, 2)), 1);
      const back = makeCoverMaterial(toTex(drawBack(item, 2)), 0.55);
      if (alive) {
        setMats({ front, back });
        requestAnimationFrame(onReady);
      }
    })();
    return () => {
      alive = false;
    };
  }, [item, onReady]);

  useEffect(
    () => () => {
      mats?.front.uniforms.uMap.value.dispose();
      mats?.back.uniforms.uMap.value.dispose();
      mats?.front.dispose();
      mats?.back.dispose();
    },
    [mats],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || !mats) return;
    const t = state.clock.elapsedTime;
    const since = t - modeStart.current;
    const p = shared.pointer.current!;
    const yaw = shared.yaw.current!;

    // Drag inertia; settle on the nearest face (front or back) when released.
    if (!yaw.dragging) {
      yaw.value += yaw.vel;
      yaw.vel *= 0.92;
      if (Math.abs(yaw.vel) < 0.002) {
        const target = Math.round(yaw.value / Math.PI) * Math.PI;
        yaw.value += (target - yaw.value) * damp(dt, 5);
      }
    }

    const tiltK = mode === "open" ? 0.22 : 0.5;
    let rx = -p.y * tiltK * 0.7;
    let ry = p.x * tiltK + yaw.value;
    let px = 0;
    let py = Math.sin(t * 1.1) * 0.04;
    let pz = 0;
    let sc = mode === "open" ? 0.94 : 1;

    if (narrow && mode === "open") {
      py += 0.95;
      sc = 0.62;
    }

    if (mode === "enter") {
      const e = ease(since / 1.1);
      pz = THREE.MathUtils.lerp(-4, 0, e);
      ry += (1 - e) * Math.PI * 1.15;
      sc *= THREE.MathUtils.lerp(0.5, 1, e);
    }
    if (mode === "launch") {
      const e = ease(since / 0.9);
      const settle = Math.round(yaw.value / (Math.PI * 2)) * Math.PI * 2;
      ry = THREE.MathUtils.lerp(ry, settle, Math.min(e * 2, 1));
      rx = THREE.MathUtils.lerp(rx, 0, Math.min(e * 2, 1));
      pz = THREE.MathUtils.lerp(0, 5.1, e);
      py = THREE.MathUtils.lerp(py, 0, e);
      sc = THREE.MathUtils.lerp(sc, 1.05, e);
    }

    const k = mode === "enter" || mode === "launch" ? 1 : damp(dt, 6);
    g.rotation.x += (rx - g.rotation.x) * k;
    g.rotation.y += (ry - g.rotation.y) * k;
    g.position.x += (px - g.position.x) * k;
    g.position.y += (py - g.position.y) * k;
    g.position.z += (pz - g.position.z) * k;
    const s = g.scale.x + (sc - g.scale.x) * k;
    g.scale.setScalar(s);

    const light = new THREE.Vector3(p.x * 3, p.y * 2.4 + 0.6, 3.2);
    for (const m of [mats.front, mats.back]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uLight.value.copy(light);
      m.uniforms.uFire.value = 0.85 + 0.15 * Math.sin(t * 3.1) * Math.sin(t * 1.7);
    }
  });

  if (!mats) return null;

  return (
    <group
      ref={group}
      onPointerDown={(e) => {
        e.stopPropagation();
        down.current = { x: e.clientX, y: e.clientY };
        shared.yaw.current!.dragging = true;
        shared.yaw.current!.vel = 0;
        (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
      }}
      onPointerUp={(e) => {
        shared.yaw.current!.dragging = false;
        const d = down.current;
        down.current = null;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) onCaseClick();
      }}
    >
      {/* plastic shell */}
      <mesh>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#141416" roughness={0.32} metalness={0.45} />
      </mesh>
      {/* spine stripe */}
      <mesh position={[-W / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D * 0.9, H * 0.98]} />
        <meshStandardMaterial color="#c2481a" roughness={0.5} emissive="#ff5b1f" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0, D / 2 + 0.002]} material={mats.front}>
        <planeGeometry args={[W * 0.97, H * 0.98]} />
      </mesh>
      <mesh position={[0, 0, -D / 2 - 0.002]} rotation={[0, Math.PI, 0]} material={mats.back}>
        <planeGeometry args={[W * 0.97, H * 0.98]} />
      </mesh>
    </group>
  );
}

function PointerLight({ shared }: { shared: Shared }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const p = shared.pointer.current!;
    light.current?.position.set(p.x * 3, p.y * 2.4 + 0.6, 3);
  });
  return <pointLight ref={light} intensity={14} distance={12} color="#fff1e0" />;
}

export default function HoloScene(props: {
  item: ShelfItem;
  mode: HoloMode;
  pointer: React.RefObject<Pointer>;
  yaw: Shared["yaw"];
  onReady: () => void;
  onCaseClick: () => void;
  narrow: boolean;
}) {
  const shared: Shared = { pointer: props.pointer, yaw: props.yaw };
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 0, 6.4], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
      aria-hidden
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[0, -2.6, 1.8]} intensity={10} distance={8} color="#ff5b1f" />
      <directionalLight position={[-3, 4, 2]} intensity={0.8} color="#cfe0ff" />
      <PointerLight shared={shared} />
      <Embers />
      <Case
        item={props.item}
        mode={props.mode}
        shared={shared}
        onReady={props.onReady}
        onCaseClick={props.onCaseClick}
        narrow={props.narrow}
      />
    </Canvas>
  );
}

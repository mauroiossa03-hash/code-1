import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Float, Environment, Lightformer, ContactShadows,
} from "@react-three/drei";
import { makeCoverTexture, makePagesTexture } from "./bookTextures.js";

/* Rotating 3D book — front cover carries the OddsFinance brand mark. */
function Book() {
  const ref = useRef();
  const coverTexture = useMemo(() => makeCoverTexture(), []);
  const pagesTexture = useMemo(() => makePagesTexture(), []);

  const materials = useMemo(() => {
    const navy = new THREE.MeshStandardMaterial({ color: "#0B1437", roughness: 0.45, metalness: 0.15 });
    const spine = new THREE.MeshStandardMaterial({ color: "#16225C", roughness: 0.4, metalness: 0.2 });
    const pages = new THREE.MeshStandardMaterial({ map: pagesTexture, roughness: 0.85, metalness: 0 });
    const front = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.35, metalness: 0.1 });
    const back = new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.35, metalness: 0.1 });
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z — front cover on +z, back cover on -z
    return [pages, spine, navy, navy, front, back];
  }, [coverTexture, pagesTexture]);

  // Static tilt so the book isn't lying flat/parallel to the ground, only the y-spin animates.
  const tilt = useMemo(() => new THREE.Euler(0.32, 0, 0.16), []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.45;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.8}>
      <group rotation={tilt}>
        <mesh ref={ref} scale={1.5} material={materials}>
          <boxGeometry args={[1.35, 1.8, 0.22]} />
        </mesh>
      </group>
    </Float>
  );
}

/* Small accent solids orbiting the book. */
function Shard({ position, color, geo = "octa", scale = 1, speed = 2 }) {
  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={2.4}>
      <mesh position={position} scale={scale}>
        {geo === "octa" && <octahedronGeometry args={[0.32, 0]} />}
        {geo === "tetra" && <tetrahedronGeometry args={[0.34, 0]} />}
        {geo === "torus" && <torusGeometry args={[0.24, 0.09, 16, 32]} />}
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.55}
          metalness={0.6} roughness={0.25}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 38 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} />
      <pointLight position={[-4, -2, 2]} intensity={28} color="#7C5CFF" />
      <pointLight position={[4, 2, -2]} intensity={22} color="#3B5BFF" />

      <Book />

      <Shard position={[2.1, 1.1, -0.5]} color="#5A74FF" geo="octa" speed={1.7} />
      <Shard position={[-2.2, 0.7, 0.4]} color="#7C5CFF" geo="tetra" speed={2.2} />
      <Shard position={[1.7, -1.5, 0.2]} color="#F0B429" geo="torus" scale={0.9} speed={1.4} />
      <Shard position={[-1.7, -1.2, -0.4]} color="#12A767" geo="octa" scale={0.8} speed={2.5} />

      <ContactShadows position={[0, -2.2, 0]} opacity={0.35} scale={9} blur={2.6} far={4} color="#1a2a5a" />

      {/* Procedural environment (no external HDR fetch) for glassy reflections. */}
      <Environment resolution={256}>
        <group rotation={[0, 0, 1]}>
          <Lightformer form="circle" intensity={3} position={[0, 5, -9]} scale={6} color="#eaf1ff" />
          <Lightformer form="rect" intensity={2} position={[-5, 1, -1]} scale={[3, 6, 1]} color="#5A74FF" />
          <Lightformer form="rect" intensity={2} position={[5, -1, -1]} scale={[3, 6, 1]} color="#7C5CFF" />
          <Lightformer form="circle" intensity={1.5} position={[0, -4, 2]} scale={4} color="#ffffff" />
        </group>
      </Environment>
    </Canvas>
  );
}

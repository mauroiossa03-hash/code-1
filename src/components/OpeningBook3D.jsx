import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { makeCoverTexture, makePagesTexture, makeInnerPageTexture } from "./bookTextures.js";

const W = 1.45, H = 1.9, COVER = 0.05, PAGES = 0.2;

/* A book whose front cover swings open and that we dolly into, driven by `progress` (0..1). */
function Book({ progressRef }) {
  const groupRef = useRef();
  const coverPivot = useRef();

  const cover = useMemo(() => makeCoverTexture(), []);
  const pages = useMemo(() => makePagesTexture(), []);
  const inner = useMemo(() => makeInnerPageTexture(), []);

  const mats = useMemo(() => {
    const navy = new THREE.MeshStandardMaterial({ color: "#0B1437", roughness: 0.45, metalness: 0.15 });
    const spine = new THREE.MeshStandardMaterial({ color: "#16225C", roughness: 0.4, metalness: 0.2 });
    const pageMat = new THREE.MeshStandardMaterial({ map: pages, roughness: 0.85 });
    const coverFront = new THREE.MeshStandardMaterial({ map: cover, roughness: 0.35, metalness: 0.1 });
    const innerMat = new THREE.MeshStandardMaterial({ map: inner, roughness: 0.9 });
    return { navy, spine, pageMat, coverFront, innerMat };
  }, [cover, pages, inner]);

  // BoxGeometry face order: +x,-x,+y,-y,+z,-z
  const frontCoverMats = useMemo(
    () => [mats.navy, mats.navy, mats.navy, mats.navy, mats.coverFront, mats.innerMat],
    [mats]
  );
  const baseMats = useMemo(
    () => [mats.pageMat, mats.spine, mats.pageMat, mats.pageMat, mats.innerMat, mats.navy],
    [mats]
  );

  useFrame((state, delta) => {
    const p = progressRef.current;
    // gentle idle spin before opening, settle straight as it opens
    if (groupRef.current) {
      const idle = (1 - p) * 0.35;
      groupRef.current.rotation.y += delta * idle;
      groupRef.current.rotation.y *= 1 - p * 0.08; // ease toward facing camera
      groupRef.current.rotation.x = -0.18 * p;     // tilt to reveal the spread
    }
    // cover swings open up to ~150°
    if (coverPivot.current) {
      coverPivot.current.rotation.y = -p * 2.6;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.6}>
      <group ref={groupRef}>
        {/* back cover + pages block */}
        <mesh material={baseMats}>
          <boxGeometry args={[W, H, PAGES]} />
        </mesh>
        {/* front cover, pivoting on the spine (left edge) */}
        <group ref={coverPivot} position={[-W / 2, 0, PAGES / 2 + COVER / 2]}>
          <mesh position={[W / 2, 0, 0]} material={frontCoverMats}>
            <boxGeometry args={[W, H, COVER]} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function Rig({ progressRef }) {
  useFrame((state) => {
    const p = progressRef.current;
    // dolly from 6 toward 1.6, drifting toward the open right-hand page
    const z = THREE.MathUtils.lerp(6, 1.6, p);
    const x = THREE.MathUtils.lerp(0, 0.5, p);
    state.camera.position.set(x, 0, z);
    state.camera.lookAt(0.2 * p, 0, 0);
  });
  return null;
}

export default function OpeningBook3D({ progressRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} />
      <pointLight position={[-4, -2, 2]} intensity={26} color="#FFB061" />
      <pointLight position={[4, 2, -2]} intensity={20} color="#FF6A3C" />

      <Rig progressRef={progressRef} />
      <Book progressRef={progressRef} />

      <ContactShadows position={[0, -1.6, 0]} opacity={0.3} scale={8} blur={2.6} far={4} color="#3a1206" />
      <Environment resolution={256}>
        <group rotation={[0, 0, 1]}>
          <Lightformer form="circle" intensity={3} position={[0, 5, -9]} scale={6} color="#fff0e0" />
          <Lightformer form="rect" intensity={2} position={[-5, 1, -1]} scale={[3, 6, 1]} color="#FFB061" />
          <Lightformer form="rect" intensity={2} position={[5, -1, -1]} scale={[3, 6, 1]} color="#FF6A3C" />
        </group>
      </Environment>
    </Canvas>
  );
}

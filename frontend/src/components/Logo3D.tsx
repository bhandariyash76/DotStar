import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function StarShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create the 4-pointed star shape (matching DotStarLogo SVG path)
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    // 4-pointed star: M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z
    const s = 1.4;
    shape.moveTo(0, s);        // top
    shape.quadraticCurveTo(0, 0, s, 0);   // top → right
    shape.quadraticCurveTo(0, 0, 0, -s);  // right → bottom
    shape.quadraticCurveTo(0, 0, -s, 0);  // bottom → left
    shape.quadraticCurveTo(0, 0, 0, s);   // left → top

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 32,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <mesh ref={meshRef} geometry={starGeometry} position={[0, 0.6, 0]}>
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.05}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.05}
        reflectivity={0.8}
        envMapIntensity={1.5}
        emissive="#ffffff"
        emissiveIntensity={0.32}
      />
    </mesh>
  );
}

function DotSphere() {
  return (
    <mesh position={[0, -1.8, 0]}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.05}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.05}
        reflectivity={0.8}
        envMapIntensity={1.5}
        emissive="#ffffff"
        emissiveIntensity={0.32}
      />
    </mesh>
  );
}

function Scene() {
  const logoRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!logoRef.current) return;
    const t = state.clock.getElapsedTime();
    logoRef.current.rotation.y = (t * Math.PI * 2) / 6.5;
  });

  return (
    <>
      {/* Lighting for clean white look */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[5, 5, 5]} intensity={3.2} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={1.8} color="#ccccff" />
      <pointLight position={[0, -3, 4]} intensity={2.4} color="#ffffff" />
      <spotLight
        position={[0, 6, 2]}
        intensity={2}
        angle={0.6}
        penumbra={0.8}
        color="#ffffff"
      />
      {/* Environment map for realistic reflections */}
      <Environment preset="city" />

      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.4}>
        <group ref={logoRef} scale={0.64} position={[0, -0.08, 0]}>
          <StarShape />
          <DotSphere />
        </group>
      </Float>
    </>
  );
}

interface Logo3DProps {
  className?: string;
}

export default function Logo3D({ className = '' }: Logo3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeLogoCanvas = () => {
      window.dispatchEvent(new Event('resize'));
    };

    const timers = [50, 250, 700, 1300].map((delay) =>
      window.setTimeout(resizeLogoCanvas, delay)
    );

    const observer = new ResizeObserver(resizeLogoCanvas);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, -0.24, 4.05], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ display: 'block', background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

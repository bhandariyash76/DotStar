import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';



function Scene() {
  const logoRef = useRef<THREE.Group>(null);
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const logoColor = "#e0e0e0"; // Silver/Metallic base
  const emissiveIntensity = isDark ? 0.15 : 0;

  useFrame((state) => {
    if (!logoRef.current) return;
    const t = state.clock.getElapsedTime();
    logoRef.current.rotation.y = (t * Math.PI * 2) / 6.5;
  });

  return (
    <>
      {/* Lighting for clean look */}
      <ambientLight intensity={isDark ? 0.6 : 0.4} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 5 : 4} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={isDark ? 3 : 2} color="#ffffff" />
      <pointLight position={[0, -3, 4]} intensity={isDark ? 4 : 3} color="#ffffff" />
      <spotLight
        position={[0, 6, 2]}
        intensity={isDark ? 2 : 1.5}
        angle={0.6}
        penumbra={0.8}
        color="#ffffff"
      />
      {/* Environment map for realistic reflections */}
      <Environment preset="city" />

      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.4}>
        <group ref={logoRef} scale={0.64} position={[0, -0.08, 0]}>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.01, 4, 4]} /> {/* dummy to hold group position if needed */}
          </mesh>
          
          {/* Star Shape */}
          <mesh position={[0, 0.6, 0]}>
             <ExtrudedStar color={logoColor} emissiveIntensity={emissiveIntensity} />
          </mesh>

          {/* Dot Sphere */}
          <mesh position={[0, -1.8, 0]}>
            <sphereGeometry args={[0.28, 32, 32]} />
            <meshPhysicalMaterial
              color={logoColor}
              metalness={1}
              roughness={0.08}
              clearcoat={1}
              clearcoatRoughness={0.02}
              reflectivity={1}
              envMapIntensity={2.5}
              emissive="#ffffff"
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        </group>
      </Float>
    </>
  );
}

function ExtrudedStar({ color, emissiveIntensity }: { color: string, emissiveIntensity: number }) {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const s = 1.4;
    shape.moveTo(0, s);
    shape.quadraticCurveTo(0, 0, s, 0);
    shape.quadraticCurveTo(0, 0, 0, -s);
    shape.quadraticCurveTo(0, 0, -s, 0);
    shape.quadraticCurveTo(0, 0, 0, s);

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

  return (
    <mesh geometry={starGeometry}>
      <meshPhysicalMaterial
        color={color}
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.02}
        reflectivity={1}
        envMapIntensity={2.5}
        emissive="#ffffff"
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
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

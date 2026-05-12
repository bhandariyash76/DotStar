'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, Float } from '@react-three/drei'
import * as THREE from 'three'

function LogoMesh() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Very slow continuous rotation
    meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2
  })

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <Center>
          <Text3D
            font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
            size={0.8}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            .Star
            <meshStandardMaterial 
              color="#D1CFC9" 
              metalness={0.8} 
              roughness={0.2} 
            />
          </Text3D>
        </Center>
      </Float>
    </group>
  )
}

export default function ThreeLogo() {
  return (
    <div className="w-32 h-10 cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a0a0a0" />
        <LogoMesh />
      </Canvas>
    </div>
  )
}




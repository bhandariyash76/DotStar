'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FabricMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Use a simple plane geometry
  const geometry = useMemo(() => new THREE.PlaneGeometry(10, 10, 64, 64), [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.6,
        metalness: 0.2,
        side: THREE.DoubleSide,
        wireframe: false,
      }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Animate the vertices to simulate flowing fabric
    const positionAttribute = geometry.getAttribute('position')
    const vertex = new THREE.Vector3()
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)
      // Math.sin/cos combined to create smooth rolling waves
      vertex.z = Math.sin(vertex.x * 2 + time) * 0.2 + Math.cos(vertex.y * 2 + time) * 0.2
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    
    positionAttribute.needsUpdate = true
    geometry.computeVertexNormals() // Update normals so lighting looks smooth
    
    // Very subtle rotation
    meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.1
  })

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} rotation={[-Math.PI / 4, 0, 0]} scale={[1.5, 1.5, 1.5]} />
  )
}

export default function FabricBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
      <Canvas camera={{ position: [0, -2, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#555555" />
        <FabricMesh />
      </Canvas>
    </div>
  )
}




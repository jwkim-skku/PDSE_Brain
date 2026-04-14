import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import { Component } from 'react'
import { mapNodeNameToRegion } from '../data/brainRegions'

const MODEL_URL = '/models/brain_regions.glb'
const defaultColor = '#9ca3af'
const regionColors = {
  'Frontal lobe': '#60a5fa',
  'Temporal lobe': '#34d399',
  'Parietal lobe': '#f59e0b',
  'Occipital lobe': '#f472b6',
  Cerebellum: '#a78bfa'
}

function applyRegionMaterial(node, selectedRegion, highlightMode) {
  const region = mapNodeNameToRegion(node.name)
  const baseColor = region ? regionColors[region] : defaultColor
  const isSelected = region && selectedRegion === region
  node.material = node.material.clone()
  node.material.color.set(baseColor)
  node.material.transparent = true
  node.material.opacity = isSelected && highlightMode ? 1 : 0.82
  node.material.roughness = 0.35
  node.material.metalness = 0.12
  node.material.emissive.set(isSelected && highlightMode ? baseColor : '#000000')
  node.material.emissiveIntensity = isSelected && highlightMode ? 0.32 : 0
}

function BrainModel({ selectedRegion, onSelectRegion, highlightMode }) {
  const { scene } = useGLTF(MODEL_URL)
  const root = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    root.traverse((node) => {
      if (!node.isMesh) {
        return
      }
      node.castShadow = true
      node.receiveShadow = true
      node.userData.region = mapNodeNameToRegion(node.name)
      applyRegionMaterial(node, selectedRegion, highlightMode)
    })
  }, [highlightMode, onSelectRegion, root, selectedRegion])

  return (
    <primitive
      object={root}
      scale={2.2}
      position={[0, -1.05, 0]}
      rotation={[0.03, -0.35, 0]}
      onPointerDown={(event) => {
        const targetRegion = event.object?.userData?.region
        if (targetRegion) {
          onSelectRegion(targetRegion)
        }
      }}
    />
  )
}

function LoadingLabel() {
  return (
    <Html center>
      <div className="brain-loading">3D 모델 로딩 중...</div>
    </Html>
  )
}

function FallbackBrain({ selectedRegion, onSelectRegion, highlightMode }) {
  const fallbackRegions = [
    { name: 'Frontal lobe', position: [0.95, 0.25, 0.15], scale: [1.15, 0.85, 1.1] },
    { name: 'Temporal lobe', position: [0.95, -0.45, 0.2], scale: [1.1, 0.7, 1.0] },
    { name: 'Parietal lobe', position: [0.2, 0.55, -0.1], scale: [1.05, 0.8, 1.0] },
    { name: 'Occipital lobe', position: [-0.85, 0.15, -0.2], scale: [0.85, 0.7, 0.9] },
    { name: 'Cerebellum', position: [-0.75, -0.7, 0.35], scale: [0.75, 0.55, 0.65] }
  ]

  return (
    <group rotation={[0, -0.4, 0]}>
      {fallbackRegions.map((region) => {
        const isSelected = selectedRegion === region.name
        return (
          <mesh
            key={region.name}
            position={region.position}
            scale={region.scale}
            onClick={(event) => {
              event.stopPropagation()
              onSelectRegion(region.name)
            }}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[0.7, 52, 52]} />
            <meshStandardMaterial
              color={regionColors[region.name]}
              transparent
              opacity={isSelected && highlightMode ? 1 : 0.82}
              emissive={isSelected && highlightMode ? regionColors[region.name] : '#000000'}
              emissiveIntensity={isSelected && highlightMode ? 0.32 : 0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function BrainScene({ selectedRegion, onSelectRegion, highlightMode }) {
  return (
    <Canvas shadows camera={{ position: [0, 1.2, 5.1], fov: 42 }}>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 3]} intensity={1.05} castShadow />
      <pointLight position={[-5, -1, -2]} intensity={0.45} color="#38bdf8" />

      <Suspense fallback={<LoadingLabel />}>
        <ModelErrorBoundary
          fallback={
            <FallbackBrain
              selectedRegion={selectedRegion}
              onSelectRegion={onSelectRegion}
              highlightMode={highlightMode}
            />
          }
        >
          <BrainModel
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            highlightMode={highlightMode}
          />
        </ModelErrorBoundary>
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={7.8}
        minPolarAngle={0.6}
        maxPolarAngle={2.4}
      />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)

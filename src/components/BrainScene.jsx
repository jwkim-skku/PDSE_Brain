import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Component } from 'react'
import { Box3, Vector3 } from 'three'
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

const fallbackRegions = [
  { name: 'Frontal lobe', position: [0.95, 0.25, 0.15], scale: [1.15, 0.85, 1.1], focus: [0.95, 0.25, 0.15] },
  { name: 'Temporal lobe', position: [0.95, -0.45, 0.2], scale: [1.1, 0.7, 1.0], focus: [0.95, -0.45, 0.2] },
  { name: 'Parietal lobe', position: [0.2, 0.55, -0.1], scale: [1.05, 0.8, 1.0], focus: [0.2, 0.55, -0.1] },
  { name: 'Occipital lobe', position: [-0.85, 0.15, -0.2], scale: [0.85, 0.7, 0.9], focus: [-0.85, 0.15, -0.2] },
  { name: 'Cerebellum', position: [-0.75, -0.7, 0.35], scale: [0.75, 0.55, 0.65], focus: [-0.75, -0.7, 0.35] }
]

function applyRegionMaterial(node, selectedRegion, highlightMode) {
  const region = node.userData.region
  const baseColor = region ? regionColors[region] : defaultColor
  const isSelected = region && selectedRegion === region

  if (!node.material) {
    return
  }
  node.material.color.set(baseColor)
  node.material.transparent = true
  node.material.opacity = isSelected && highlightMode ? 1 : 0.82
  node.material.roughness = 0.35
  node.material.metalness = 0.12
  node.material.emissive.set(isSelected && highlightMode ? baseColor : '#000000')
  node.material.emissiveIntensity = isSelected && highlightMode ? 0.32 : 0
}

function BrainModel({
  selectedRegion,
  onSelectRegion,
  highlightMode,
  onMeshDebugChange,
  onRegionCentersChange
}) {
  const { scene } = useGLTF(MODEL_URL)
  const root = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const recognizedMeshes = []
    const unmappedMeshes = []
    const accum = {}
    const box = new Box3()
    const center = new Vector3()

    root.updateWorldMatrix(true, true)
    root.traverse((node) => {
      if (!node.isMesh) {
        return
      }
      node.castShadow = true
      node.receiveShadow = true

      if (!node.userData.materialPrepared && node.material) {
        node.material = node.material.clone()
        node.userData.materialPrepared = true
      }

      node.userData.region = mapNodeNameToRegion(node.name)
      if (node.userData.region) {
        recognizedMeshes.push({ meshName: node.name, region: node.userData.region })
        box.setFromObject(node)
        box.getCenter(center)
        if (!accum[node.userData.region]) {
          accum[node.userData.region] = { sum: [0, 0, 0], count: 0 }
        }
        accum[node.userData.region].sum[0] += center.x
        accum[node.userData.region].sum[1] += center.y
        accum[node.userData.region].sum[2] += center.z
        accum[node.userData.region].count += 1
      } else {
        unmappedMeshes.push(node.name)
      }
    })

    const centers = {}
    Object.entries(accum).forEach(([region, value]) => {
      centers[region] = [
        value.sum[0] / value.count,
        value.sum[1] / value.count,
        value.sum[2] / value.count
      ]
    })
    onRegionCentersChange(centers)
    onMeshDebugChange({
      source: 'glb',
      totalMeshes: recognizedMeshes.length + unmappedMeshes.length,
      recognizedMeshes,
      unmappedMeshes
    })
  }, [onMeshDebugChange, onRegionCentersChange, root])

  useEffect(() => {
    root.traverse((node) => {
      if (node.isMesh) {
        applyRegionMaterial(node, selectedRegion, highlightMode)
      }
    })
  }, [highlightMode, root, selectedRegion])

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

function FallbackBrain({
  selectedRegion,
  onSelectRegion,
  highlightMode,
  onMeshDebugChange,
  onRegionCentersChange
}) {
  useEffect(() => {
    const centers = {}
    fallbackRegions.forEach((region) => {
      centers[region.name] = region.focus
    })
    onRegionCentersChange(centers)
    onMeshDebugChange({
      source: 'fallback',
      totalMeshes: fallbackRegions.length,
      recognizedMeshes: fallbackRegions.map((region) => ({ meshName: region.name, region: region.name })),
      unmappedMeshes: []
    })
  }, [onMeshDebugChange, onRegionCentersChange])

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

function CameraRig({ selectedRegion, regionCenters, controlsRef }) {
  const desiredPosition = useRef(new Vector3())
  const desiredTarget = useRef(new Vector3())

  useFrame(({ camera }) => {
    const center = regionCenters[selectedRegion] ?? [0, 0, 0]
    desiredPosition.current.set(center[0], center[1] + 0.7, center[2] + 3.2)
    desiredTarget.current.set(center[0], center[1], center[2])

    camera.position.lerp(desiredPosition.current, 0.08)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, 0.12)
      controlsRef.current.update()
    }
  })

  return null
}

export function BrainScene({ selectedRegion, onSelectRegion, highlightMode, onMeshDebugChange }) {
  const controlsRef = useRef(null)
  const [regionCenters, setRegionCenters] = useState({})

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
              onMeshDebugChange={onMeshDebugChange}
              onRegionCentersChange={setRegionCenters}
            />
          }
        >
          <BrainModel
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            highlightMode={highlightMode}
            onMeshDebugChange={onMeshDebugChange}
            onRegionCentersChange={setRegionCenters}
          />
        </ModelErrorBoundary>
      </Suspense>
      <CameraRig selectedRegion={selectedRegion} regionCenters={regionCenters} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={2.4}
        maxDistance={7.8}
        minPolarAngle={0.6}
        maxPolarAngle={2.4}
      />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)

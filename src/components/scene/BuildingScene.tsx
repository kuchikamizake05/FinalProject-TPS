import { Billboard, OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Elevator, Passenger } from '../../simulation/types'

interface BuildingSceneProps {
  elevators: Elevator[]
  waitingQueues: Record<string, Passenger[]>
}

const maxFloor = 11
const floorStep = 0.56
const slabY = (index: number) => index * floorStep
const floorY = (floor: number) => (floor - 0.5) * floorStep
const buildingDepth = 1.72
const buildingCenterZ = 0.42
const buildingBackZ = buildingCenterZ - buildingDepth / 2
const buildingFrontZ = buildingCenterZ + buildingDepth / 2
const sideColumnX = 4.74
const simulationRenderOrder = 10
const elevatorRenderOrder = 24
const passengerRenderOrder = 1000
const passengerColor = '#ef4444'

type ShaftLayout = { x: number; z: number; queueX: number; queueZ: number; color: string }

const shaftLayout: Record<string, ShaftLayout> = {
  WN: { x: -2.5, z: 0.36, queueX: -3.6, queueZ: buildingFrontZ - 0.42, color: '#ffb35c' },
  WS: { x: -1.7, z: 0.36, queueX: -1.2, queueZ: buildingFrontZ - 0.42, color: '#ffd08a' },
  EN: { x: 1.7, z: 0.36, queueX: 0.6, queueZ: buildingFrontZ - 0.42, color: '#5fd4c8' },
  ES: { x: 2.5, z: 0.36, queueX: 3.0, queueZ: buildingFrontZ - 0.42, color: '#8ff0e5' },
}

interface ZoomControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  onRegister: (actions: { zoomIn: () => void; zoomOut: () => void }) => void
}

function ZoomController({ controlsRef, onRegister }: ZoomControllerProps) {
  const { camera } = useThree()

  useEffect(() => {
    const zoom = (factor: number) => {
      if (camera && controlsRef.current) {
        const controls = controlsRef.current
        const target = controls.target

        const dir = new Vector3().subVectors(camera.position, target)
        const newDist = dir.length() * factor
        const clampedDist = Math.max(6.5, Math.min(20, newDist))

        dir.normalize().multiplyScalar(clampedDist)
        camera.position.copy(target).add(dir)
        controls.update()
      }
    }

    onRegister({
      zoomIn: () => zoom(0.85),
      zoomOut: () => zoom(1.15),
    })
  }, [camera, controlsRef, onRegister])

  return null
}

export function BuildingScene({ elevators, waitingQueues }: BuildingSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [zoomActions, setZoomActions] = useState<{ zoomIn: () => void; zoomOut: () => void } | null>(null)

  return (
    <section className="scene-shell">
      <Canvas camera={{ position: [5.7, 5.35, 12.3], fov: 34 }} shadows>
        <color attach="background" args={['#d7e4ed']} />
        <ambientLight intensity={0.82} />
        <directionalLight position={[2.5, 8, 5]} intensity={1.55} castShadow />
        <SceneContent elevators={elevators} waitingQueues={waitingQueues} />
        <OrbitControls ref={controlsRef} enablePan={true} minDistance={5.8} maxDistance={18} maxPolarAngle={Math.PI / 2.08} />
        <ZoomController controlsRef={controlsRef} onRegister={setZoomActions} />
      </Canvas>

      {zoomActions && (
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={zoomActions.zoomIn} aria-label="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button className="zoom-btn" onClick={zoomActions.zoomOut} aria-label="Zoom Out">
            <ZoomOut size={18} />
          </button>
        </div>
      )}
    </section>
  )
}

function SceneContent({ elevators, waitingQueues }: BuildingSceneProps) {
  const { camera } = useThree()
  const [shellOpacity, setShellOpacity] = useState(0.82)

  useFrame(() => {
    const distance = camera.position.length()
    const baseOpacity = Math.max(0.14, Math.min(0.82, (distance - 6.5) / 7.5))
    const nextOpacity = Math.max(0.12, Math.min(0.82, baseOpacity * 0.66))
    setShellOpacity((current) => (Math.abs(current - nextOpacity) > 0.025 ? nextOpacity : current))
  })

  return (
    <group position={[0, -3.05, 0]}>
      <SglcFacade shellOpacity={shellOpacity} />
      <FloorSlabs shellOpacity={shellOpacity} />
      <ElevatorSystem elevators={elevators} waitingQueues={waitingQueues} />
      <FloorLabels />
    </group>
  )
}

function SglcFacade({ shellOpacity }: { shellOpacity: number }) {
  const wallOpacity = Math.max(0.12, shellOpacity)
  const coreOpacity = Math.max(0.18, shellOpacity * 0.92)
  const frameOpacity = Math.max(0.18, shellOpacity * 0.84)

  return (
    <group>
      <mesh position={[0, 3.1375, buildingBackZ]} receiveShadow>
        <boxGeometry args={[8.7, 6.275, 0.22]} />
        <meshStandardMaterial color="#eef3f6" roughness={0.42} transparent opacity={wallOpacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, 3.1375, buildingCenterZ]} receiveShadow>
        <boxGeometry args={[8.96, 6.275, buildingDepth]} />
        <meshStandardMaterial color="#f6f8f8" roughness={0.5} transparent opacity={Math.max(0.08, wallOpacity * 0.18)} depthWrite={false} />
      </mesh>
      <SideWing x={-4.38} opacity={frameOpacity} />
      <SideWing x={4.38} opacity={frameOpacity} />

      {/* Center partition (Sekat Timur-Barat) */}
      <group position={[0, 3.1375, buildingCenterZ]}>
        {/* Glass Panel */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.02, 6.275, buildingDepth * 0.96]} />
          <meshStandardMaterial 
            color="#eef3f6" 
            transparent 
            opacity={Math.max(0.22, shellOpacity * 0.46)} 
            roughness={0.1} 
            metalness={0.9} 
            depthWrite={false} 
          />
        </mesh>
        {/* Front Metal Column Frame */}
        <mesh position={[0, 0, buildingDepth / 2 - 0.02]} castShadow>
          <boxGeometry args={[0.04, 6.275, 0.04]} />
          <meshStandardMaterial color="#eef3f6" transparent opacity={Math.max(0.42, shellOpacity)} depthWrite={false} />
        </mesh>
        {/* Back Metal Column Frame */}
        <mesh position={[0, 0, -buildingDepth / 2 + 0.02]} castShadow>
          <boxGeometry args={[0.04, 6.275, 0.04]} />
          <meshStandardMaterial color="#eef3f6" transparent opacity={Math.max(0.42, shellOpacity)} depthWrite={false} />
        </mesh>
      </group>

      <TopCrown opacity={frameOpacity} />
      <SideColumn x={-sideColumnX} opacity={coreOpacity} />
      <SideColumn x={sideColumnX} opacity={coreOpacity} label="FT UGM" />
      <mesh position={[0, -0.34, buildingCenterZ]} receiveShadow>
        <boxGeometry args={[10.2, 0.68, 1.82]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}

function SideWing({ x, opacity }: { x: number; opacity: number }) {
  return (
    <group position={[x, 3.1375, buildingCenterZ]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.26, 6.275, buildingDepth]} />
        <meshStandardMaterial color="#f4f6f6" roughness={0.5} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[x > 0 ? -0.22 : 0.22, -0.175, buildingFrontZ - buildingCenterZ + 0.02]}>
        <boxGeometry args={[0.08, 5.925, 0.07]} />
        <meshStandardMaterial color="#dfe4e6" roughness={0.46} transparent opacity={Math.max(0.16, opacity * 0.7)} depthWrite={false} />
      </mesh>
    </group>
  )
}

function FloorSlabs({ shellOpacity }: { shellOpacity: number }) {
  const opacity = Math.max(0.2, shellOpacity * 0.95)

  return (
    <group>
      {Array.from({ length: maxFloor + 1 }, (_, index) => index).map((index) => {
        const y = slabY(index)
        const isFloor1 = index === 0

        return (
        <group key={index} position={[0, y, buildingCenterZ]}>
          <mesh receiveShadow>
            <boxGeometry args={[8.72, 0.04, buildingDepth * 0.94]} />
            <meshStandardMaterial 
              color="#eef3f6" 
              roughness={0.5} 
              transparent={!isFloor1} 
              opacity={isFloor1 ? 1 : opacity} 
              depthWrite={isFloor1} 
            />
          </mesh>
          <mesh position={[0, 0.025, buildingFrontZ - buildingCenterZ + 0.03]}>
            <boxGeometry args={[8.72, 0.045, 0.045]} />
            <meshStandardMaterial 
              color="#ffffff" 
              roughness={0.46} 
              transparent={!isFloor1} 
              opacity={isFloor1 ? 1 : Math.min(0.72, opacity + 0.18)} 
              depthWrite={isFloor1} 
            />
          </mesh>
        </group>
        )
      })}
    </group>
  )
}

function TopCrown({ opacity }: { opacity: number }) {
  return (
    <group position={[0, 10 * floorStep + 0.5, buildingCenterZ]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[8.7, 0.38, buildingDepth]} />
        <meshStandardMaterial color="#f7f8f7" roughness={0.52} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[1.34, 0.42, -0.12]}>
        <boxGeometry args={[0.64, 0.26, 0.78]} />
        <meshStandardMaterial color="#e9eeee" roughness={0.5} transparent opacity={Math.max(0.18, opacity * 0.82)} depthWrite={false} />
      </mesh>
    </group>
  )
}

function SideColumn({ x, label }: { x: number; opacity: number; label?: string }) {
  const labelSide = x > 0 ? 0.34 : -0.34
  const labelRotation = x > 0 ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={[x, 2.8, buildingCenterZ]}>
      {/* Main concrete column */}
      <mesh position={[0, 0.395, 0]} castShadow>
        <boxGeometry args={[0.62, 6.39, buildingDepth * 0.72]} />
        <meshStandardMaterial color="#f2f4f4" roughness={0.48} metalness={0.1} />
      </mesh>
      
      {/* Blue window strip next to the column */}
      <mesh position={[x > 0 ? -0.23 : 0.23, 0.2375, buildingFrontZ - buildingCenterZ - 0.02]}>
        <boxGeometry args={[0.16, 6.075, 0.12]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.26} metalness={0.3} />
      </mesh>

      {/* Horizontal white accent bands (ribs) wrapping around the column at each floor level */}
      {Array.from({ length: 12 }).map((_, index) => {
        const localY = index * floorStep - 2.8
        return (
          <mesh key={index} position={[x > 0 ? 0.02 : -0.02, localY, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.66, 0.042, buildingDepth * 0.72 + 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        )
      })}

      {/* Vertical 'FT UGM' letters positioned perfectly centered within the panels between white bands */}
      {label
        ? label.split('').map((letter, index) => {
            const panelIndex = 10 - index
            const localY = (panelIndex + 0.5) * floorStep - 2.8
            return (
              <Text
                key={`${letter}-${index}`}
                position={[labelSide, localY, 0.08]}
                rotation={[0, labelRotation, 0]}
                fontSize={0.28}
                fontWeight="bold"
                color="#1e3a8a"
                anchorX="center"
                anchorY="middle"
              >
                {letter}
              </Text>
            )
          })
        : null}
    </group>
  )
}

function ElevatorSystem({ elevators, waitingQueues }: BuildingSceneProps) {
  return (
    <group>
      <BankGuide x={-2.1} label="BARAT" />
      <BankGuide x={2.1} label="TIMUR" />
      {elevators.map((elevator) => {
        const layout = shaftLayout[elevator.id]
        return layout ? (
          <group key={elevator.id}>
            <ElevatorShaft elevator={elevator} layout={layout} />
            <QueueDots elevator={elevator} passengers={waitingQueues[elevator.id] ?? []} layout={layout} />
          </group>
        ) : null
      })}
    </group>
  )
}

function BankGuide({ x, label }: { x: number; label: string }) {
  const displayColor = label === 'BARAT' ? '#c2410c' : '#0f766e'
  return (
    <group>
      <Text
        position={[x, 11 * floorStep + 0.66, buildingFrontZ + 0.05]}
        fontSize={0.17}
        fontWeight="bold"
        color={displayColor}
        anchorX="center"
        renderOrder={simulationRenderOrder + 10}
        material-depthTest={false}
        material-depthWrite={false}
      >
        {label}
      </Text>
    </group>
  )
}

function ElevatorShaft({ elevator, layout }: { elevator: Elevator; layout: ShaftLayout }) {
  const labelColor = elevator.bank === 'west' ? '#7c2d12' : '#115e59'
  const displayLabel = elevator.label.split(' ').pop() ?? elevator.label

  return (
    <group renderOrder={simulationRenderOrder}>
      <mesh position={[layout.x, 3.1, layout.z]} castShadow renderOrder={simulationRenderOrder - 1}>
        <boxGeometry args={[0.42, 6.2, 0.2]} />
        <meshStandardMaterial color="#132137" transparent opacity={0.92} metalness={0.2} roughness={0.35} depthWrite={false} />
      </mesh>
      {elevator.servedFloors.map((floor) => (
        <FloorServiceMarker key={`${elevator.id}-${floor}`} floor={floor} layout={layout} />
      ))}
      <Text
        position={[layout.x, 11 * floorStep + 0.32, buildingFrontZ + 0.05]}
        fontSize={0.12}
        fontWeight="bold"
        color={labelColor}
        anchorX="center"
        renderOrder={simulationRenderOrder + 10}
        material-depthTest={false}
        material-depthWrite={false}
      >
        {displayLabel}
      </Text>
      <ElevatorCar elevator={elevator} layout={layout} />
    </group>
  )
}

function FloorServiceMarker({ floor, layout }: { floor: number; layout: ShaftLayout }) {
  return (
    <group position={[layout.x, floorY(floor), layout.z]} renderOrder={simulationRenderOrder + 2}>
      <mesh position={[0, 0, 0.13]} renderOrder={simulationRenderOrder + 2}>
        <boxGeometry args={[0.52, 0.52, 0.045]} />
        <meshStandardMaterial color={layout.color} emissive={layout.color} emissiveIntensity={0.28} transparent opacity={0.46} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.13]} renderOrder={simulationRenderOrder + 2}>
        <boxGeometry args={[0.52, 0.52, 0.045]} />
        <meshStandardMaterial color={layout.color} emissive={layout.color} emissiveIntensity={0.22} transparent opacity={0.34} depthWrite={false} />
      </mesh>
      <mesh position={[0.255, 0, 0]} renderOrder={simulationRenderOrder + 2}>
        <boxGeometry args={[0.045, 0.52, 0.34]} />
        <meshStandardMaterial color={layout.color} emissive={layout.color} emissiveIntensity={0.22} transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[-0.255, 0, 0]} renderOrder={simulationRenderOrder + 2}>
        <boxGeometry args={[0.045, 0.52, 0.34]} />
        <meshStandardMaterial color={layout.color} emissive={layout.color} emissiveIntensity={0.22} transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.185]} renderOrder={simulationRenderOrder + 3}>
        <boxGeometry args={[0.46, 0.42, 0.035]} />
        <meshStandardMaterial color={layout.color} emissive={layout.color} emissiveIntensity={0.42} transparent opacity={0.64} depthWrite={false} />
      </mesh>
    </group>
  )
}

function ElevatorCar({ elevator, layout }: { elevator: Elevator; layout: ShaftLayout }) {
  const passengerCount = elevator.passengers.reduce((sum, passenger) => sum + passenger.groupSize, 0)

  return (
    <group position={[layout.x, floorY(elevator.currentFloor), layout.z + 0.3]} renderOrder={elevatorRenderOrder}>
      {/* Main Blue Body */}
      <mesh castShadow renderOrder={elevatorRenderOrder}>
        <boxGeometry args={[0.58, 0.5, 0.52]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Door Panel */}
      <mesh position={[0, 0, 0.265]} renderOrder={elevatorRenderOrder + 1}>
        <boxGeometry args={[0.46, 0.36, 0.045]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.15} />
      </mesh>

      {/* Floating Passenger Count Badge */}
      {passengerCount > 0 && (
        <Billboard position={[0, 0.38, 0.1]} renderOrder={passengerRenderOrder + 10}>
          <group renderOrder={passengerRenderOrder + 10}>
            {/* Background circular badge */}
            <mesh renderOrder={passengerRenderOrder + 10}>
              <circleGeometry args={[0.12, 16]} />
              <meshBasicMaterial color="#ef4444" transparent={true} opacity={1} depthTest={false} depthWrite={false} toneMapped={false} />
            </mesh>
            {/* Passenger Count Text */}
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.15}
              fontWeight="bold"
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              renderOrder={passengerRenderOrder + 11}
              material-depthTest={false}
              material-depthWrite={false}
            >
              {passengerCount}
            </Text>
          </group>
        </Billboard>
      )}

      <PassengerLoadDots elevator={elevator} />
    </group>
  )
}

function PassengerLoadDots({ elevator }: { elevator: Elevator }) {
  const passengerCount = elevator.passengers.reduce((sum, passenger) => sum + passenger.groupSize, 0)

  return (
    <group position={[-0.22, -0.07, 0.39]} renderOrder={passengerRenderOrder}>
      {Array.from({ length: Math.min(passengerCount, 6) }, (_, index) => (
        <PassengerDot key={index} position={[(index % 4) * 0.15, Math.floor(index / 4) * 0.135, 0]} size={0.09} />
      ))}
    </group>
  )
}

function PassengerDot({ position, size }: { position: [number, number, number]; size: number }) {
  return (
    <Billboard position={position} renderOrder={passengerRenderOrder}>
      <group>
        {/* Torso */}
        <mesh renderOrder={passengerRenderOrder} position={[0, -size * 0.15, 0]} frustumCulled={false}>
          <circleGeometry args={[size * 0.68, 10, 0, Math.PI]} />
          <meshBasicMaterial color={passengerColor} transparent opacity={1} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* Head */}
        <mesh renderOrder={passengerRenderOrder} position={[0, size * 0.58, 0]} frustumCulled={false}>
          <circleGeometry args={[size * 0.42, 10]} />
          <meshBasicMaterial color={passengerColor} transparent opacity={1} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </Billboard>
  )
}

function QueueDots({
  elevator,
  passengers,
  layout,
}: {
  elevator: Elevator
  passengers: Passenger[]
  layout: ShaftLayout
}) {
  const byFloor = passengers.reduce<Record<number, number>>((acc, passenger) => {
    acc[passenger.originFloor] = (acc[passenger.originFloor] ?? 0) + passenger.groupSize
    return acc
  }, {})

  return (
    <group>
      {Object.entries(byFloor).map(([floor, count]) => {
        const isLeftQueue = elevator.id === 'WN' || elevator.id === 'EN'
        const labelX = isLeftQueue ? -0.2 : 0.8
        const labelAnchor = isLeftQueue ? 'right' : 'left'

        return (
          <group key={`${elevator.id}-${floor}`} position={[layout.queueX, slabY(Number(floor) - 1), layout.queueZ]}>
            {Array.from({ length: Math.min(count, 6) }, (_, index) => (
              <PassengerDot key={index} position={[(index % 4) * 0.2, Math.floor(index / 4) * 0.18, 0]} size={0.09} />
            ))}
            {count ? (
              <Text
                position={[labelX, 0.11, 0.02]}
                fontSize={0.18}
                fontWeight="bold"
                color={passengerColor}
                anchorX={labelAnchor}
                renderOrder={passengerRenderOrder}
                material-depthTest={false}
                material-depthWrite={false}
              >
                x{count}
              </Text>
            ) : null}
          </group>
        )
      })}
    </group>
  )
}

function FloorLabels() {
  return (
    <group>
      {Array.from({ length: maxFloor }, (_, index) => index + 1).map((floor) => (
        <Text
          key={floor}
          position={[-5.34, floorY(floor), buildingFrontZ]}
          fontSize={0.16}
          fontWeight="bold"
          color={floor === 2 || floor === 3 ? '#7e8b98' : '#0b1626'}
          anchorX="center"
          renderOrder={simulationRenderOrder}
          material-depthTest={false}
          material-depthWrite={false}
        >
          L{floor}
        </Text>
      ))}
    </group>
  )
}

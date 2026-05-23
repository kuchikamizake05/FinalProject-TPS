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
    <section className="relative w-full h-full overflow-hidden border-none rounded-none bg-transparent shadow-none">
      <Canvas camera={{ position: [5.7, 5.35, 12.3], fov: 34 }}>
        <color attach="background" args={['#d7e4ed']} />
        <ambientLight intensity={0.82} />
        <directionalLight position={[2.5, 8, 5]} intensity={1.25} />
        <directionalLight position={[-4, 7, -9]} intensity={1.45} />
        <SceneContent elevators={elevators} waitingQueues={waitingQueues} />
        <OrbitControls ref={controlsRef} enablePan={true} minDistance={5.8} maxDistance={18} maxPolarAngle={Math.PI / 2.08} />
        <ZoomController controlsRef={controlsRef} onRegister={setZoomActions} />
      </Canvas>

      {zoomActions && (
        <div className="absolute bottom-5 right-5 flex flex-col gap-2 p-2 rounded-2xl bg-[#252c38] border border-[#323c4c]/25 shadow-neu-flat z-10 hover:shadow-neu-flat-hover transition-all duration-300">
          <button
            className="group w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-accent-cyan bg-[#252c38] shadow-neu-flat hover:shadow-neu-flat-hover active:shadow-neu-inset border border-[#323c4c]/15 hover:border-accent-cyan/30 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
            onClick={zoomActions.zoomIn}
            aria-label="Zoom In"
            title="Zoom In"
          >
            <ZoomIn size={18} className="transition-transform duration-200 group-hover:scale-110" />
          </button>
          <button
            className="group w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-accent-cyan bg-[#252c38] shadow-neu-flat hover:shadow-neu-flat-hover active:shadow-neu-inset border border-[#323c4c]/15 hover:border-accent-cyan/30 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
            onClick={zoomActions.zoomOut}
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <ZoomOut size={18} className="transition-transform duration-200 group-hover:scale-110" />
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
      <FloorSlabs />
      <ElevatorSystem elevators={elevators} waitingQueues={waitingQueues} />
      <FloorLabels />
    </group>
  )
}

function SglcFacade({ shellOpacity }: { shellOpacity: number }) {
  const frameOpacity = Math.max(0.18, shellOpacity * 0.84)

  return (
    <group>
      {/* Solid Back Concrete Wall */}
      <mesh position={[0, 3.45, buildingBackZ + 0.04]} receiveShadow>
        <boxGeometry args={[8.7, 5.78, 0.08]} />
        <meshStandardMaterial color="#eef3f6" roughness={0.42} transparent={false} opacity={1} depthWrite />
      </mesh>
      
      {/* Detailed Facade Panels & Windows (placed at the back, facing outwards (+Z)) */}
      <BackFacadeDetails />

      <SideWing x={-4.38} opacity={frameOpacity} />
      <SideWing x={4.38} opacity={frameOpacity} />

      {/* Center partition (Sekat Timur-Barat) */}
      <group position={[0, 3.4175, buildingCenterZ]}>
        {/* Glass Panel — removed for fully transparent front */}
        <mesh castShadow receiveShadow visible={false}>
          <boxGeometry args={[0.02, 5.715, buildingDepth * 0.96]} />
          <meshStandardMaterial 
            color="#eef3f6" 
            transparent 
            opacity={0} 
            roughness={0.1} 
            metalness={0.9} 
            depthWrite={false} 
          />
        </mesh>
        {/* Front Metal Column Frame */}
        <mesh position={[0, 0, buildingDepth / 2 - 0.02]} castShadow>
          <boxGeometry args={[0.04, 5.715, 0.04]} />
          <meshStandardMaterial color="#eef3f6" transparent opacity={Math.max(0.42, shellOpacity)} depthWrite={false} />
        </mesh>
        {/* Back Metal Column Frame */}
        <mesh position={[0, 0, -buildingDepth / 2 + 0.02]} castShadow>
          <boxGeometry args={[0.04, 5.715, 0.04]} />
          <meshStandardMaterial color="#eef3f6" transparent opacity={Math.max(0.42, shellOpacity)} depthWrite={false} />
        </mesh>
      </group>

      <TopCrown />
      <SideColumn x={-sideColumnX} />
      <SideColumn x={sideColumnX} label="FT UGM" />
      
      {/* Ground Floor (Lantai 1) Structural Pillars ("Tiang-Tiang") - Back Side Only */}
      {[-4.0, -2.4, -0.8, 0.8, 2.4, 4.0].map((x, idx) => (
        <group key={`ground-pillar-${idx}`}>
          {/* Back structural pillar */}
          <mesh position={[x, 0.28, buildingBackZ + 0.06]} castShadow receiveShadow>
            <boxGeometry args={[0.08, 0.56, 0.08]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.34, buildingCenterZ]} receiveShadow>
        <boxGeometry args={[10.2, 0.68, 1.82]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}

function BackFacadeDetails() {
  return (
    <group position={[0, 3.1, buildingBackZ - 0.04]} rotation={[0, Math.PI, 0]}>
      {/* 1. Horizontal White Spandrel Floor Bands for all 12 floor slab lines */}
      {Array.from({ length: 12 }).map((_, f) => {
        const y = f * floorStep - 3.1
        return (
          <mesh key={`back-slab-band-${f}`} position={[0, y, -0.01]} receiveShadow castShadow>
            <boxGeometry args={[8.2, 0.07, 0.07]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        )
      })}

      {/* 2. Continuous Blue Glass Facade for center window bays (Bays 2, 3, 4) - Floors 2 to 10 (skip f = 0 for open ground floor) */}
      <group position={[0, 0, -0.035]}>
        {Array.from({ length: 10 }).map((_, f) => {
          if (f === 0) return null
          const y = f * floorStep - 3.1 + 0.28
          return (
            <group key={`win-center-f-${f}`} position={[0, y, 0]}>
              {/* Render three central window groups at x = -1.6, 0, 1.6 */}
              {[-1.6, 0, 1.6].map((xOffset) => (
                <group key={`win-pane-${xOffset}`} position={[xOffset, 0, 0]}>
                  {/* Glass Panel */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.5, 0.48, 0.02]} />
                    <meshStandardMaterial 
                      color="#ffffff" 
                      roughness={0.2} 
                      metalness={0.1} 
                      transparent 
                      opacity={0.3} 
                    />
                  </mesh>
                  {/* Detailed structural white window frame grid: 2 vertical mullions, 1 horizontal transom */}
                  {/* Horizontal Transom */}
                  <mesh position={[0, 0, 0.011]} castShadow>
                    <boxGeometry args={[1.48, 0.02, 0.02]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.4} />
                  </mesh>
                  {/* Two Vertical Mullions */}
                  {[-0.25, 0.25].map((mx) => (
                    <mesh key={`mullion-${mx}`} position={[mx, 0, 0.012]} castShadow>
                      <boxGeometry args={[0.02, 0.48, 0.02]} />
                      <meshStandardMaterial color="#ffffff" roughness={0.4} />
                    </mesh>
                  ))}
                  {/* Outer dark grey window borders for contrast */}
                  <mesh position={[-0.74, 0, 0.01]}>
                    <boxGeometry args={[0.015, 0.48, 0.018]} />
                    <meshStandardMaterial color="#374151" roughness={0.5} />
                  </mesh>
                  <mesh position={[0.74, 0, 0.01]}>
                    <boxGeometry args={[0.015, 0.48, 0.018]} />
                    <meshStandardMaterial color="#374151" roughness={0.5} />
                  </mesh>
                </group>
              ))}
            </group>
          )
        })}
      </group>

      {/* 3. Outer white panel bays with horizontal siding slats and small windows (Bays 1 and 5 at x = -3.2 and 3.2, skip f = 0 for open ground floor) */}
      {[-3.2, 3.2].map((xOffset) => (
        <group key={`outer-bay-${xOffset}`} position={[xOffset, 0, -0.035]}>
          {Array.from({ length: 10 }).map((_, f) => {
            if (f === 0) return null
            const y = f * floorStep - 3.1 + 0.28
            const isLeftBay = xOffset < 0
            const winLocalX = isLeftBay ? 0.38 : -0.38
            
            return (
              <group key={`outer-panel-f-${f}`} position={[0, y, 0]}>
                {/* White Background Panel */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.5, 0.48, 0.02]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.45} />
                </mesh>
                
                {/* 4 horizontal thin lines/slats across the white panel for realistic siding texture */}
                {Array.from({ length: 4 }).map((_, s) => {
                  const slatLocalY = (s - 1.5) * 0.11
                  return (
                    <mesh key={`siding-slat-${s}`} position={[0, slatLocalY, 0.011]} castShadow>
                      <boxGeometry args={[1.5, 0.014, 0.008]} />
                      <meshStandardMaterial color="#d1d5db" roughness={0.5} />
                    </mesh>
                  )
                })}

                {/* Small detailed window opening */}
                <group position={[winLocalX, 0, 0.012]}>
                  {/* Small Glass Window */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.48, 0.34, 0.015]} />
                    <meshStandardMaterial 
                      color="#ffffff" 
                      roughness={0.2} 
                      metalness={0.1} 
                      transparent 
                      opacity={0.3} 
                    />
                  </mesh>
                  {/* Small Window White Frame */}
                  <mesh position={[0, 0, 0.002]} receiveShadow>
                    <boxGeometry args={[0.52, 0.38, 0.01]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.35} />
                  </mesh>
                  {/* Small Window Inner Dark Frame */}
                  <mesh position={[0, 0, 0.005]}>
                    <boxGeometry args={[0.49, 0.35, 0.008]} />
                    <meshStandardMaterial color="#4b5563" roughness={0.5} />
                  </mesh>
                </group>
              </group>
            )
          })}
        </group>
      ))}

      {/* 4. Structural vertical divide columns/piers (floors 1 to 9) at x = [-4.0, -2.4, -0.8, 0.8, 2.4, 4.0] */}
      {[-4.0, -2.4, -0.8, 0.8, 2.4, 4.0].map((x, idx) => {
        const height = 9 * floorStep // 5.04
        const y = -0.02
        return (
          <mesh key={`divider-fin-${idx}`} position={[x, y, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[0.07, height - 0.02, 0.09]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        )
      })}

      {/* 5. Top section (Floor 11 only) - dense vertical architectural fins */}
      <group position={[0, 0, -0.035]}>
        {/* Dense vertical white fins (30 fins) mirroring the beautiful sunshades on SGLC building */}
        {Array.from({ length: 30 }).map((_, index) => {
          const x = -3.85 + index * 0.265
          return (
            <mesh key={`top-fin-${index}`} position={[x, 2.78, 0.035]} castShadow receiveShadow>
              <boxGeometry args={[0.045, 0.50, 0.07]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function SideWing({ x, opacity }: { x: number; opacity: number }) {
  return (
    <group position={[x, 3.4175, buildingCenterZ]}>
      {/* Glass body removed — fully transparent front facade */}
      <mesh receiveShadow visible={false}>
        <boxGeometry args={[0.26, 5.715, buildingDepth]} />
        <meshStandardMaterial color="#f4f6f6" roughness={0.5} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[x > 0 ? -0.22 : 0.22, -0.175, buildingFrontZ - buildingCenterZ + 0.02]}>
        <boxGeometry args={[0.08, 5.365, 0.07]} />
        <meshStandardMaterial color="#dfe4e6" roughness={0.46} transparent opacity={Math.max(0.16, opacity * 0.7)} depthWrite={false} />
      </mesh>
    </group>
  )
}

function FloorSlabs() {
  return (
    <group>
      {Array.from({ length: maxFloor + 1 }, (_, index) => index).map((index) => {
        const y = slabY(index)
        const isFloor1 = index === 0

        // Skip top slab — TopCrown already provides the roof beam
        if (index === maxFloor) return null

        return (
        <group key={index} position={[0, y, buildingCenterZ]}>
          {/* Main slab */}
          <mesh receiveShadow>
            <boxGeometry args={[8.72, 0.04, buildingDepth * 0.94]} />
            <meshStandardMaterial 
              color="#eef3f6" 
              roughness={0.5} 
              transparent={!isFloor1} 
              opacity={isFloor1 ? 1 : 0.55} 
              depthWrite={isFloor1} 
            />
          </mesh>
          {/* Front horizontal white band */}
          <mesh position={[0, 0.025, buildingFrontZ - buildingCenterZ + 0.03]}>
            <boxGeometry args={[8.72, 0.045, 0.045]} />
            <meshStandardMaterial color="#ffffff" roughness={0.46} transparent={false} opacity={1} depthWrite />
          </mesh>
          {/* Back horizontal white band */}
          <mesh position={[0, 0.025, buildingBackZ - buildingCenterZ - 0.03]}>
            <boxGeometry args={[8.72, 0.045, 0.045]} />
            <meshStandardMaterial color="#ffffff" roughness={0.46} transparent={false} opacity={1} depthWrite />
          </mesh>
        </group>
        )
      })}
    </group>
  )
}

function TopCrown() {
  return (
    <group position={[0, 10 * floorStep + 0.55, buildingCenterZ]}>
      {/* Main slab */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[8.7, 0.18, buildingDepth]} />
        <meshStandardMaterial color="#f7f8f7" roughness={0.52} transparent={false} opacity={1} depthWrite />
      </mesh>
      
      {/* Elevator motor room / penthouse structure */}
      <mesh position={[1.34, 0.52, -0.12]}>
        <boxGeometry args={[0.64, 0.26, 0.78]} />
        <meshStandardMaterial color="#e9eeee" roughness={0.5} transparent={false} opacity={1} depthWrite />
      </mesh>

      {/* Elegant Architectural Roof Pergola Frame (Sunshade Beams) */}
      <group position={[0, 0.37, 0]}>
        {/* Long horizontal front and back beams */}
        <mesh position={[0, 0.12, buildingDepth / 2 - 0.08]} castShadow>
          <boxGeometry args={[8.5, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.12, -buildingDepth / 2 + 0.08]} castShadow>
          <boxGeometry args={[8.5, 0.06, 0.06]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        
        {/* Vertical columns/posts supporting the pergola */}
        {[-4.0, -2.8, -1.6, -0.4, 0.8, 2.0, 3.2, 4.0].map((xVal, pIdx) => (
          <group key={`pergola-post-${pIdx}`} position={[xVal, 0.03, 0]}>
            {/* Front Post */}
            <mesh position={[0, 0, buildingDepth / 2 - 0.08]} castShadow>
              <boxGeometry args={[0.05, 0.18, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
            {/* Back Post */}
            <mesh position={[0, 0, -buildingDepth / 2 + 0.08]} castShadow>
              <boxGeometry args={[0.05, 0.18, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.35} />
            </mesh>
          </group>
        ))}

        {/* Transverse thin louvre slats across the roof pergola (14 slats) */}
        {Array.from({ length: 14 }).map((_, sIdx) => {
          const xVal = -4.1 + sIdx * 0.63
          return (
            <mesh key={`roof-slat-${sIdx}`} position={[xVal, 0.15, 0]} castShadow>
              <boxGeometry args={[0.04, 0.02, buildingDepth - 0.14]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function SideColumn({ x, label }: { x: number; label?: string }) {
  const labelSide = x > 0 ? 0.34 : -0.34
  const labelRotation = x > 0 ? Math.PI / 2 : -Math.PI / 2

  const thickness = 0.07
  const innerFaceX = x > 0 ? -0.31 : 0.31
  const blueX = innerFaceX + (x > 0 ? thickness / 2 : -thickness / 2)
  const whiteX = innerFaceX - (x > 0 ? thickness / 2 : -thickness / 2)
  const panelHeight = 6.39
  const panelY = 0.395

  return (
    <group position={[x, 2.8, buildingCenterZ]}>
      {/* Main concrete column - split into stone-grey base (L1 & L2) and white upper structure */}
      {/* Base (L1 & L2) - grey stone */}
      <mesh position={[0, -2.24, 0]} castShadow>
        <boxGeometry args={[0.62, 1.12, buildingDepth * 0.72]} />
        <meshStandardMaterial color="#6b7280" roughness={0.76} metalness={0.06} />
      </mesh>
      {/* Upper (L3 to L11) - white concrete */}
      <mesh position={[0, 0.955, 0]} castShadow>
        <boxGeometry args={[0.62, 5.27, buildingDepth * 0.72]} />
        <meshStandardMaterial color="#ffffff" roughness={0.48} metalness={0.1} />
      </mesh>
      
      {/* Exterior blue panel — covers side gap, visible from the outside */}
      <mesh position={[blueX, panelY, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingDepth, panelHeight, thickness]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.26} metalness={0.3} />
      </mesh>

      {/* Interior white panel — covers side gap, visible from the inside */}
      <mesh position={[whiteX, panelY, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingDepth, panelHeight, thickness]} />
        <meshStandardMaterial color="#ffffff" roughness={0.48} metalness={0.1} />
      </mesh>

      {/* Horizontal white accent bands (ribs) wrapping around the column at each floor level */}
      {Array.from({ length: 12 }).map((_, index) => {
        const localY = index * floorStep - 2.8
        // No white bands for Floors 1 and 2 (index 0, 1, and 2)
        if (index < 3) return null

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
              <group key={`${letter}-${index}`}>
                {/* Main side label (facing outwards) */}
                <Text
                  position={[labelSide, localY, 0.08]}
                  rotation={[0, labelRotation, 0]}
                  fontSize={0.32}
                  fontWeight="bold"
                  color="#1e3a8a"
                  anchorX="center"
                  anchorY="middle"
                >
                  {letter}
                </Text>
              </group>
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
    <Billboard position={[x, 11 * floorStep + 1.0, buildingFrontZ + 0.05]} renderOrder={simulationRenderOrder + 10}>
      <Text
        fontSize={0.38}
        fontWeight="bold"
        color={displayColor}
        anchorX="center"
        material-depthTest
        material-depthWrite={false}
      >
        {label}
      </Text>
    </Billboard>
  )
}

function ElevatorShaft({ elevator, layout }: { elevator: Elevator; layout: ShaftLayout }) {
  const labelColor = elevator.bank === 'west' ? '#7c2d12' : '#115e59'
  const displayLabel = elevator.label.split(' ').pop() ?? elevator.label
  const labelX = layout.x + (elevator.id.endsWith('N') ? -0.12 : 0.12)

  return (
    <group renderOrder={simulationRenderOrder}>
      <mesh position={[layout.x, 3.1, layout.z]} castShadow renderOrder={simulationRenderOrder - 1}>
        <boxGeometry args={[0.42, 6.2, 0.2]} />
        <meshStandardMaterial color="#132137" transparent opacity={0.92} metalness={0.2} roughness={0.35} depthWrite={false} />
      </mesh>
      {elevator.servedFloors.map((floor) =>
        floor === maxFloor ? null : (
          <FloorServiceMarker key={`${elevator.id}-${floor}`} floor={floor} layout={layout} />
        )
      )}
      <Billboard position={[labelX, 11 * floorStep + 0.65, buildingFrontZ + 0.05]} renderOrder={simulationRenderOrder + 10}>
        <Text
          fontSize={0.23}
          fontWeight="bold"
          color={labelColor}
          anchorX="center"
          material-depthTest
          material-depthWrite={false}
        >
          {displayLabel}
        </Text>
      </Billboard>
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
  const leftDoorRef = useRef<any>(null)
  const rightDoorRef = useRef<any>(null)

  const isDoorOpen = elevator.status === 'boarding' || (elevator.status === 'idle' && Math.round(elevator.currentFloor) === 1)

  useFrame((_state, delta) => {
    if (leftDoorRef.current && rightDoorRef.current) {
      const targetOffset = isDoorOpen ? 0.18 : 0.0
      const targetLeftX = -0.115 - targetOffset
      const targetRightX = 0.115 + targetOffset
      const speed = 10
      leftDoorRef.current.position.x += (targetLeftX - leftDoorRef.current.position.x) * Math.min(1, delta * speed)
      rightDoorRef.current.position.x += (targetRightX - rightDoorRef.current.position.x) * Math.min(1, delta * speed)
    }
  })

  return (
    <group position={[layout.x, floorY(elevator.currentFloor), layout.z + 0.3]} renderOrder={elevatorRenderOrder}>
      {/* Main Blue Body */}
      <mesh castShadow renderOrder={elevatorRenderOrder}>
        <boxGeometry args={[0.58, 0.5, 0.52]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.2} />
      </mesh>
      
      {/* Dark Interior Background (visible when doors open) */}
      <mesh position={[0, 0, 0.261]} renderOrder={elevatorRenderOrder + 0.5}>
        <boxGeometry args={[0.6, 0.52, 0.002]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      
      {/* Animated Left Door Panel */}
      <mesh ref={leftDoorRef} position={[-0.115, 0, 0.265]} renderOrder={elevatorRenderOrder + 1}>
        <boxGeometry args={[0.23, 0.36, 0.045]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.15} />
      </mesh>

      {/* Animated Right Door Panel */}
      <mesh ref={rightDoorRef} position={[0.115, 0, 0.265]} renderOrder={elevatorRenderOrder + 1}>
        <boxGeometry args={[0.23, 0.36, 0.045]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.15} />
      </mesh>

      {/* Floating Passenger Count Badge */}
      {passengerCount > 0 && (
        <Billboard position={[0, 0.38, 0.1]} renderOrder={passengerRenderOrder + 10}>
          <group renderOrder={passengerRenderOrder + 10}>
            {/* Background circular badge */}
            <mesh renderOrder={passengerRenderOrder + 10}>
              <circleGeometry args={[0.13, 16]} />
              <meshBasicMaterial color="#ef4444" transparent={true} opacity={1} depthTest={false} depthWrite={false} toneMapped={false} />
            </mesh>
            {/* Passenger Count Text */}
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.16}
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
                fontSize={0.20}
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
        <Billboard
          key={floor}
          position={[-5.34, floorY(floor), buildingFrontZ + 0.05]}
          renderOrder={simulationRenderOrder}
        >
          <Text
            fontSize={0.28}
            fontWeight="bold"
            color={floor === 2 || floor === 3 ? '#7e8b98' : '#0b1626'}
            anchorX="center"
            material-depthTest={true}
            material-depthWrite={false}
          >
            L{floor}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}

import React, { useRef } from 'react'
import { MapControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

const Controls = () => {
  const { camera } = useThree()
  const cameraLastPosition = useRef({
    x: camera.position.x,
    z: camera.position.z,
  })

  return (
    <MapControls
      minDistance={20}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2}
      enableRotate={false}
      screenSpacePanning={false}
      onChange={(e) => {
        const maxX = 100
        const minX = -100
        const maxZ = 100
        const minZ = -100
        const x = e?.target.target.x
        const z = e?.target.target.z

        if (x < minX || x > maxX) {
          e?.target.target.setX(x < minX ? minX : maxX)
          camera.position.setX(cameraLastPosition.current.x)
        }
        if (z < minZ || z > maxZ) {
          e?.target.target.setZ(z < minZ ? minZ : maxZ)
          camera.position.setZ(cameraLastPosition.current.z)
        }
        cameraLastPosition.current.x = camera.position.x
        cameraLastPosition.current.z = camera.position.z
      }}
    />
  )
}

export default Controls

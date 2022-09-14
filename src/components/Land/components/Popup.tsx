import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Html } from '@react-three/drei'

import styles from '@/components/Land/land.module.css'
import { MeshParcel } from '@/model/landModel'

export type PopupHandle = {
  show: (mesh: MeshParcel) => void
  hide: () => void
}

const Popup = forwardRef((props, ref) => {
  {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [showPopup, setShowPopup] = useState(false)
    const [mesh, setMesh] = useState<MeshParcel | null>(null)

    useImperativeHandle(ref, () => ({
      show: (mesh: MeshParcel) => {
        setMesh(mesh)
        timeoutRef.current = setTimeout(() => {
          setShowPopup(true)
        }, 300)
      },
      hide: () => {
        timeoutRef.current && clearTimeout(timeoutRef.current)
        setShowPopup(false)
      },
    }))

    return (
      <group
        position={
          mesh
            ? [
                mesh.position.x,
                mesh.position.y,
                mesh.position.z - (mesh.position.x === 0 && mesh.position.z === 0 ? 15 : 10),
              ]
            : undefined
        }
      >
        {showPopup && (
          <Html distanceFactor={30} transform sprite zIndexRange={[5, 0]}>
            <div className={styles.popup}># {mesh && mesh.userData.number}</div>
          </Html>
        )}
      </group>
    )
  }
})

export default Popup

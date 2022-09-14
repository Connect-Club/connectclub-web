import React from 'react'
import { Html } from '@react-three/drei'

import styles from '@/components/Land/land.module.css'
import { FC } from '@/model/commonModel'
import { Lands } from '@/model/landModel'

type Props = {
  lands: Lands
}
const MeshDebugHelpers: FC<Props> = ({ lands }) => {
  const DELTA = 5
  return (
    <>
      {lands.map((g) => (
        <>
          {g.parcels.map((p) => (
            <Html
              distanceFactor={30}
              key={p.id}
              transform
              sprite
              zIndexRange={[5, 0]}
              position={[p.x * DELTA, 0, p.y * DELTA]}
            >
              <div className={styles.popup_debug}>
                # {p.number}; s: {p.sector}
                <br />({p.x}; {p.y})
              </div>
            </Html>
          ))}
        </>
      ))}
    </>
  )
}
export default MeshDebugHelpers

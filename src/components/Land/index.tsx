import React from 'react'
import { Canvas } from '@react-three/fiber'

import { useLands } from '@/api/landApi'
import Controls from '@/components/Land/components/Controls'
import MeshDebugHelpers from '@/components/Land/components/MeshDebugHelpers'
import Meshes from '@/components/Land/components/Meshes'
import SlideParcelBlock from '@/components/Land/components/SlideParcelBlock'
import { useStore } from '@/components/Land/components/useStore'
import styles from '@/components/Land/land.module.css'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

type Props = {
  isDebug: boolean
}

const LandMap: FC<Props> = ({ isDebug = false }) => {
  const emitOnPointerMissed = useStore((state) => state.emitOnPointerMissed)
  const setIsDebugMode = useStore((state) => state.setIsDebugMode)

  setIsDebugMode(isDebug)

  const [lands, , isLandLoading] = useLands()

  if (isDevelopment) {
    console.log('[!] Canvas rendering')
  }

  const onPointerMissed = () => {
    emitOnPointerMissed()
  }

  return (
    <div className={styles.scene_outer_wrapper}>
      <div className={styles.scene_wrapper}>
        {isLandLoading ? (
          <div className={'align-center'}>
            <Loader />
          </div>
        ) : (
          lands && (
            <Canvas
              camera={{
                near: 4,
                far: 500,
                position: [0, 160, 35],
              }}
              gl={{ physicallyCorrectLights: true }}
              onPointerMissed={onPointerMissed}
            >
              <hemisphereLight args={['white', 'darkslategrey', 1.3]} />
              <directionalLight color='white' position={[50, 50, 50]} intensity={1.5} />
              <color attach='background' args={['#b9e9fd']} />
              <Controls />
              <Meshes lands={lands} />

              {isDebug && (
                <>
                  <MeshDebugHelpers lands={lands} />
                  <gridHelper args={[150, 150]} />
                </>
              )}
            </Canvas>
          )
        )}
        <SlideParcelBlock />
      </div>
    </div>
  )
}

export default LandMap

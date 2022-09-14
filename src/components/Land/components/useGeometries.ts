import { useMemo } from 'react'
import { CylinderGeometry } from 'three'

function useGeometries() {
  const parcelInitialParams = useMemo(
    () => ({
      RADIUS_TOP: 5,
      RADIUS_BOTTOM: 5,
      HEIGHT: 1,
      SEGMENTS: 6,
      SEGMENTS_HEIGHT: 1,
    }),
    [],
  )
  const centralParcelInitialParams = useMemo(
    () => ({
      RADIUS_TOP: 10,
      RADIUS_BOTTOM: 10,
      HEIGHT: 1,
      SEGMENTS: 6,
      SEGMENTS_HEIGHT: 1,
    }),
    [],
  )

  const centralParcelGeometry = useMemo(() => {
    return new CylinderGeometry(
      centralParcelInitialParams['RADIUS_TOP'],
      centralParcelInitialParams['RADIUS_BOTTOM'],
      centralParcelInitialParams['HEIGHT'],
      centralParcelInitialParams['SEGMENTS'],
      centralParcelInitialParams['SEGMENTS_HEIGHT'],
    )
  }, [centralParcelInitialParams])

  const parcelGeometry = useMemo(() => {
    return new CylinderGeometry(
      parcelInitialParams['RADIUS_TOP'],
      parcelInitialParams['RADIUS_BOTTOM'],
      parcelInitialParams['HEIGHT'],
      parcelInitialParams['SEGMENTS'],
      parcelInitialParams['SEGMENTS_HEIGHT'],
    )
  }, [parcelInitialParams])

  return {
    centralParcelGeometry,
    parcelGeometry,
  }
}

export { useGeometries }

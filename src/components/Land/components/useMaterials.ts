import { useMemo } from 'react'
import { MeshStandardMaterial } from 'three'

function useMaterials() {
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: '#002a65',
    })
  }, [])

  const freeParcelMaterial = material.clone()
  freeParcelMaterial.color.setHex(0xcccccc)

  return { material, freeParcelMaterial }
}

export { useMaterials }

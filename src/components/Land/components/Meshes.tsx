import React, { useEffect, useRef } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { AddEquation, CustomBlending, MathUtils, OneMinusSrcAlphaFactor, SrcColorFactor, TextureLoader } from 'three'

import Popup, { PopupHandle } from '@/components/Land/components/Popup'
import { useGeometries } from '@/components/Land/components/useGeometries'
import { useMaterials } from '@/components/Land/components/useMaterials'
import { useStore } from '@/components/Land/components/useStore'
import { getUrlWithSizes } from '@/lib/helpers'
import { isDevelopment } from '@/lib/utils'
import { Lands, MeshParcel, ParcelOnMap } from '@/model/landModel'

type Props = {
  lands: Lands
}
const Meshes = ({ lands }: Props) => {
  if (isDevelopment) {
    console.log('[!] Meshes rendering')
  }

  const selected = useRef<MeshParcel | null>(null)
  const preSelectedElement = useRef<MeshParcel['id'] | null>(null)
  const popupRef = useRef<PopupHandle | null>(null)
  const activePopupRef = useRef<PopupHandle | null>(null)

  const { centralParcelGeometry, parcelGeometry } = useGeometries()
  const { material, freeParcelMaterial } = useMaterials()
  const DELTA = 5

  const textureLoader = new TextureLoader()
  const setActiveParcel = useStore((state) => state.setActiveParcel)

  /* Reset appearance for the previously selected object */
  const unselectParcel = () => {
    if (selected.current) {
      selected.current.scale.set(1, 1, 1)
      selected.current.material.color.setHex(
        selected.current.userData.hasImage ? 0xffffff : selected.current.userData.color,
      )
    }
  }
  /* Subscribers */
  useEffect(
    () =>
      useStore.subscribe(
        (state) => state.onPointerMissedEvent,
        () => {
          popupRef.current?.hide()
          activePopupRef.current?.hide()
          unselectParcel()
        },
      ),
    [],
  )

  /* Single parcel */
  const Parcel = ({ data }: { data: ParcelOnMap }) => {
    if (isDevelopment) {
      console.log('[!] Parcel rendering')
    }
    const parcelMaterial = data.available ? freeParcelMaterial.clone() : material.clone()

    const onHover = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const target = e.eventObject as MeshParcel
      target.scale.set(1.05, 1.05, 1.05)

      popupRef.current?.show(target)
    }
    const onLeave = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()

      if (!selected.current || selected.current?.userData.id !== e.eventObject.userData.id) {
        e.eventObject.scale.set(1, 1, 1)
      }
      popupRef.current?.hide()
      preSelectedElement.current = null
    }
    const onClick = (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      const target = e.eventObject as MeshParcel

      /* Use this to prevent click after movement the pointer outside the parcel and then back */
      if (preSelectedElement.current !== target.userData.id) {
        return
      }
      unselectParcel()

      /* Set new appearance */
      target.scale.set(1.05, 1.05, 1.05)
      target.material.color.setHex(0xff0000)
      selected.current = Object.assign({}, target)

      /* Show popup */
      activePopupRef.current?.show(target)
      setActiveParcel(data)
    }

    const onDown = (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      preSelectedElement.current = e.eventObject.userData.id
    }

    const getTexture = async (url: string) => {
      const texture = await textureLoader.loadAsync(url)
      texture.matrixAutoUpdate = false
      texture.matrix.setUvTransform(0, 0, 1, 1, MathUtils.degToRad(90), 0.5, 0.5)

      parcelMaterial.map = texture
      parcelMaterial.needsUpdate = true
      parcelMaterial.color.set(0xffffff)

      parcelMaterial.blending = CustomBlending
      parcelMaterial.blendSrc = SrcColorFactor
      parcelMaterial.blendDst = OneMinusSrcAlphaFactor
      parcelMaterial.blendEquation = AddEquation
      parcelMaterial.toneMapped = false
    }

    if (data.thumb) {
      getTexture(getUrlWithSizes(data.thumb, 500, 500)).then()
    }

    return (
      <>
        <mesh
          geometry={data.x === 0 && data.y === 0 ? centralParcelGeometry : parcelGeometry}
          material={parcelMaterial}
          position={[data.x * DELTA, 0, data.y * DELTA]}
          userData={{ id: data.id, number: data.number, color: parcelMaterial.color.getHex(), hasImage: !!data.thumb }}
          onPointerOver={onHover}
          onPointerLeave={onLeave}
          onPointerUp={onClick}
          onPointerDown={onDown}
        />
      </>
    )
  }

  return (
    <>
      {lands.map((g) => (
        <group key={g.sector}>
          {g.parcels.map((p) => (
            <Parcel key={p.id} data={p} />
          ))}
        </group>
      ))}
      <Popup ref={popupRef} />
      <Popup ref={activePopupRef} />
    </>
  )
}

export default Meshes

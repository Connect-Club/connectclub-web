import { BufferGeometry, Mesh, MeshStandardMaterial } from 'three'

export type MeshParcel = Mesh<BufferGeometry, MeshStandardMaterial>

export type ParcelOnMap = {
  id: string
  number: number
  thumb: string | null
  x: number
  y: number
  ownerAddress: string | null
  ownerUsername: string | null
  available: boolean
  sector: number
}

export type Parcel = ParcelOnMap & {
  name: string
  description: string
  roomId: string
  roomPassword: string
  roomDescription: string
  image: string | null
}

export type Lands = Array<{
  sector: Parcel['sector']
  parcels: Parcel[]
}>

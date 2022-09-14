export type ImageType = {
  id: number
  originalName: string
  processedName: string
  width: number | null
  height: number | null
  resizerUrl: string
  bucket: string
  uploadAt: number
}

export type LocationPhoneNumberFormats = {
  detectRegionCode: string
  availableRegions: {
    [key: string]: {
      regionPrefix: string
      name: string
      possibleLength: number[]
      pattern: string
      example: string
    }
  }
}

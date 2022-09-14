type MenuBaseType = {
  name: string
  link: string
  disabled?: boolean
}

export type MenuType = MenuBaseType & {
  subpages?: Array<MenuBaseType & { description: string }>
}

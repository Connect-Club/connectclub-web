import React from 'react'
import { ColorResult } from 'react-color'
import { FormInstance } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'

import { Params } from '@/model/commonModel'

export type Landings = Array<Omit<Landing, 'params'>>

type Color = ColorResult['rgb']
export type Landing = {
  id: string
  name: string
  status: 'active' | 'hide' | 'delete'
  url: string
  title: string
  subtitle: string
  header_image?: UploadFile[] | undefined
  params: Params & {
    modules: Module[]
    seo: {
      title: string
      description: string
      index: boolean
    }
    colors: {
      background: Color
      footer_background: Color
      footer_text_color: Color
      title: Color
      subtitle: Color
      link: Color
      link_hover: Color
      text: Color
    }
  }
}

export type ModuleType = 'text' | 'js' | string

export type Module = {
  id: ModuleType
  name: string
  title?: string
  params?: Params
  index?: number
}

export type ModuleProps = {
  form: FormInstance
}

export type ModuleWithComponent<V = any> = Module & {
  Component: React.ComponentType<ModuleProps>
  beforeSave?: (values: V) => V
}

export type Table = {
  title: string
  description: string
  color: Color
  rows: string[]
}

export type FormField = {
  type: 'input:text' | 'email'
  code: string
  required: boolean
  show_name: boolean
  name: string
  placeholder: string
}

export type FormAdditionalData = {
  name: string
  value: string
}

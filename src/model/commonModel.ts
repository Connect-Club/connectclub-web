import React from 'react'

import { Errors } from '@/model/apiModel'
import { FestivalLayoutProps } from '@/model/festivalModel'

export type FC<P = unknown> = ((props: P) => JSX.Element) & {
  propTypes?: Params
  whyDidYouRender?: boolean | Record<string, string>
}
export type FCWithLayout<P = unknown> = FC<P> & {
  getLayout: React.ComponentType
}
export type FCWithLayoutParams<P> = FCWithLayout<P> & {
  getLayoutParams: FestivalLayoutProps
}

export type Params = { [key: string]: any }

export type FilterParams = {
  lastValue?: number | null
  limit?: number
}

export type GetTokenType = {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token: string
  event: string
}

export type TokenApiResponse = {
  data: GetTokenType
  _cc_errors: Errors
}

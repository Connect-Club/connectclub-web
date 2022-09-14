import type { IronSessionOptions } from 'iron-session'

export const sessionOptions: IronSessionOptions = {
  password: process.env.OH_MY_GOD!,
  cookieName: process.env.ADMIN_COOKIE_NAME!,
  cookieOptions: {
    secure: process.env.COOKIE_OPTIONS_SECURE === 'true',
  },
}

declare module 'iron-session' {
  interface IronSessionData {
    token?: string
    scope?: string
    refresh_token?: string
  }
}

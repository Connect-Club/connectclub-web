import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { IronSession } from 'iron-session'

import { doRequest } from '@/lib/Api'
import { getUsersParams } from '@/lib/helpers'
import { useApiResponse } from '@/lib/useApi'
import { useStore } from '@/lib/useStore'
import { Errors, State } from '@/model/apiModel'
import { CurrentUser, PublicUser, SearchUsers, User, Users, UserToken, UserWithScope } from '@/model/usersModel'

export const getCurrentUser = async (token: string): Promise<[CurrentUser | null, Errors, boolean]> => {
  const response = await doRequest<CurrentUser>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_ACCOUNT!,
    params: {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  })

  return [response?.data?.response || null, response._cc_errors, response.securityError]
}

export const getSessionUser = async (
  session: IronSession,
  allowedScopes = ['admin'],
): Promise<[UserWithScope, boolean, boolean]> => {
  const token = session.token
  const sessionScope = session.scope
  const scope: string[] = (sessionScope && sessionScope.split(' ')) || []
  let isLoggedIn = !!token
  let scopeError = false

  let user = { scope: scope } as UserWithScope

  if (isLoggedIn && token) {
    const [currentUser, , forceLogout] = await getCurrentUser(token)
    if (forceLogout) {
      session.destroy()
      isLoggedIn = false
    }
    if (currentUser) {
      user = { ...currentUser, ...user }
    }
  } else {
    session.destroy()
  }
  if (isLoggedIn && allowedScopes.length && !scope.filter((value) => allowedScopes.includes(value.trim())).length) {
    scopeError = true
    session.destroy()
    isLoggedIn = false
  }
  user.scope = scope

  return [user, isLoggedIn, scopeError]
}

export const getUsers = async (limit = 20, filter = {}, lastId = 0, orderBy = 'id:DESC'): Promise<State<Users>> => {
  return await doRequest<Users>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_USERS! + getUsersParams(limit, filter, lastId, orderBy),
  })
}

export const getUser = async (userId: string): Promise<[User | undefined, Errors]> => {
  const response = await doRequest<Users>({
    method: 'GET',
    endpoint:
      process.env.NEXT_PUBLIC_API_GET_USERS! +
      getUsersParams(1, {
        [isNaN(parseInt(userId)) ? 'username' : 'id']: userId,
      }),
  })

  return [response?.data?.response?.items?.[0], response._cc_errors]
}

export const getPublicUser = async (username: string): Promise<[PublicUser | undefined, Errors]> => {
  const response = await doRequest<PublicUser>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_PUBLIC_USER_INFO!.replace(/{username}/, encodeURIComponent(username)),
  })

  return [response?.data?.response, response._cc_errors]
}

type UsersReturn = [Array<User>, boolean, Dispatch<SetStateAction<User[]>>, number, number]

export const useUsers = (limit = 20, filter = {}, lastId = 0, orderBy = 'id:DESC'): UsersReturn => {
  const url = process.env.NEXT_PUBLIC_API_GET_USERS! + getUsersParams(limit, filter, lastId, orderBy)
  const [response, , isLoading] = useApiResponse<Users>(url)
  const [data, setData] = useState<Array<User>>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response?.totalCount || 0, response?.lastValue || 0]
}

export const useUserNftTokens = (): [UserToken[], boolean] => {
  const url = process.env.NEXT_PUBLIC_API_GET_USER_NFT_TOKENS!
  const [response, , isLoading] = useApiResponse<{
    items: Array<UserToken>
  }>(url)
  const [data, setData] = useState<Array<UserToken>>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading]
}

export const searchUsers = async (search: string | number, limit = 20): Promise<State<Users | SearchUsers>> => {
  let response
  if (typeof search === 'number') {
    response = await doRequest<Users>({
      method: 'GET',
      endpoint: process.env.NEXT_PUBLIC_API_GET_USERS! + `?limit=${limit}&filter=${JSON.stringify({ id: search })}`,
    })
  } else {
    response = await doRequest<SearchUsers>({
      method: 'GET',
      endpoint: process.env.NEXT_PUBLIC_API_GET_SEARCH_USERS! + `?limit=${limit}&search=${encodeURIComponent(search)}`,
    })
  }

  return response
}

export const useFrontendUser = (): [CurrentUser | null, boolean] => {
  const storageToken = useStore((state) => state.token)
  const clearToken = useStore((state) => state.clearToken)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      if (storageToken?.access_token) {
        const [currentUser] = await getCurrentUser(storageToken.access_token)
        setUser(currentUser || null)

        if (!currentUser) {
          clearToken()
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    getUser().then()
  }, [clearToken, storageToken?.access_token])

  return [user, isLoading]
}

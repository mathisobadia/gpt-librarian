import { createSignal, Signal } from 'solid-js'
import { UserProperties } from '../../../services/functions/auth/types'

const getAPIUrl = (path: string, workspaceId: string): string => {
  const urlParams = new URLSearchParams({ workspaceId })
  return `${import.meta.env.VITE_REST_URL}${path}?${urlParams.toString()}`
}

export const makeRequest = async <T>(params: {
  path: string
  workspaceId: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  searchQuery?: string
}): Promise<T> => {
  const { path, workspaceId, method, body, searchQuery } = params
  const [token] = useToken
  if (!token()) {
    throw new Error('No token')
  }
  console.log(token())
  const url = searchQuery ? getAPIUrl(path, workspaceId) + `&searchquery=${searchQuery}` : getAPIUrl(path, workspaceId)
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token()!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (response.status !== 200) {
    throw new Error('Failed to make request')
  }
  return await response.json()
}

export type Claims = {
  iat: number
  exp?: number | undefined
  properties: UserProperties
  type: 'user'
}
export const useSession = () => {
  const [token, setToken] = useToken
  const logout = () => setToken(null)
  const claims = () => {
    if (!token()) {
      logout()
      return undefined
    }
    const decoded = parseJwt(token())
    if (!decoded) {
      logout()
      return undefined
    }
    const exp = decoded.exp
    const now = Date.now() / 1000
    if (exp && now > exp) {
      logout()
      return undefined
    }
    return decoded
  }
  return { claims, logout, setToken }
}

const parseJwt = (token: string | null): {
  iat: number
  exp?: number | undefined
  properties: {
    name: string
    email: string
  }
  type: 'user'
} | undefined => {
  if (!token) {
    return undefined
  }
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
  return JSON.parse(jsonPayload)
}

const createStoredSignal = <T> (
  key: string,
  defaultValue: T,
  storage = localStorage
): Signal<T> => {
  const item = storage.getItem(key)
  const initialValue = item
    ? JSON.parse(item) as T
    : defaultValue

  const [value, setValue] = createSignal<T>(initialValue)

  const setValueAndStore = ((arg) => {
    const v = setValue(arg)
    if (v === null) {
      storage.removeItem(key)
    } else {
      storage.setItem(key, JSON.stringify(v))
    }
    return v
  }) as typeof setValue

  return [value, setValueAndStore]
}

const useToken = createStoredSignal<null | string>('token', null, localStorage)

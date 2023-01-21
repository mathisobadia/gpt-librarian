import { createMutation } from '@tanstack/solid-query'
import { getAPIUrl } from './utils'

const syncConnection = async (
  { workspaceId, connectionId }:
  { workspaceId: string
    connectionId: string }
): Promise<string> => {
  const response = await fetch(getAPIUrl('/sync-connection', workspaceId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ connectionId }),
    credentials: 'include'
  })
  if (response.status !== 200) {
    throw new Error('Failed to fetch connections')
  }
  return await response.json()
}

export const syncConnectionsMutation = (onSuccess?: (res: string) => void) => {
  return createMutation(['connection'], syncConnection, { onSuccess })
}

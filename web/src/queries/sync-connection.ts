import { createMutation } from '@tanstack/solid-query'
import { makeRequest } from './utils'

const syncConnection = async (
  { workspaceId, connectionId }:
  { workspaceId: string
    connectionId: string }
): Promise<string> => {
  const response = await makeRequest<string>({
    path: '/sync-connection',
    workspaceId,
    method: 'POST',
    body: { connectionId }
  })
  return response
}

export const syncConnectionsMutation = (onSuccess?: (res: string) => void) => {
  return createMutation(['connection'], syncConnection, { onSuccess })
}

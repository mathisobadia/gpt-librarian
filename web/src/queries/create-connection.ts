import type {
  CreateConnectionRequest,
  CreateConnectionResponse
} from '@gpt-librarian/services/functions/connection/types'
import { createMutation } from '@tanstack/solid-query'
import { getAPIUrl } from './utils'

const createConnection = async (
  params: CreateConnectionRequest & { workspaceId: string }
): Promise<CreateConnectionResponse> => {
  const response = await fetch(
    getAPIUrl('/create-connection', params.workspaceId),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(params)
    }
  )
  if (response.status !== 200) {
    throw new Error('Failed to create connection')
  }
  return await response.json()
}

export const createConnectionMutation = (onSuccess?: (res: CreateConnectionResponse) => void) => {
  return createMutation(['connection'], createConnection, { onSuccess })
}

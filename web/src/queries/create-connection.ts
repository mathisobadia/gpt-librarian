import type {
  CreateConnectionRequest,
  CreateConnectionResponse
} from '@gpt-librarian/services/functions/connection/types'
import { createMutation } from '@tanstack/solid-query'
import { makeRequest } from './query-utils'

const createConnection = async (
  params: CreateConnectionRequest & { workspaceId: string }
): Promise<CreateConnectionResponse> => {
  const response = await makeRequest<CreateConnectionResponse>({
    path: '/create-connection',
    workspaceId: params.workspaceId,
    method: 'POST',
    body: params
  })
  return response
}

export const createConnectionMutation = (onSuccess?: (res: CreateConnectionResponse) => void) => {
  return createMutation(['connection'], createConnection, { onSuccess })
}

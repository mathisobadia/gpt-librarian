import { ListConnectionsResponse } from '@gpt-librarian/services/functions/connection/types'
import { makeRequest } from './query-utils'

export const listConnections = async (
  workspaceId: string
): Promise<ListConnectionsResponse> => {
  const response = makeRequest<ListConnectionsResponse>({
    path: '/list-connections',
    workspaceId,
    method: 'GET'
  })
  return await response
}

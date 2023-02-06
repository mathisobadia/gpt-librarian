import type { ListUserWorkspacesResponse } from '../../../services/functions/workspace/types'
import { createQuery } from '@tanstack/solid-query'
import { makeRequest } from './query-utils'
const listUserWorkspaces = async (): Promise<ListUserWorkspacesResponse> => {
  const response = await makeRequest<ListUserWorkspacesResponse>({
    path: '/list-user-workspaces',
    method: 'GET',
    workspaceId: ''
  })
  return response
}

export const listUserWorkspacesQuery = (onSuccess?: (data: ListUserWorkspacesResponse) => void, onError?: () => void) => {
  return createQuery(
    () => ['workspaces'],
    listUserWorkspaces,
    {
      retry: false,
      onSuccess,
      onError
    }
  )
}

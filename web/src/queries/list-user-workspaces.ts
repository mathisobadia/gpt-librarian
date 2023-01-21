import type { ListUserWorkspacesResponse } from '@gpt-librarian/services/functions/workspace/types'
import { createQuery } from '@tanstack/solid-query'
import { makeRequest } from './utils'
const listUserWorkspaces = async (): Promise<ListUserWorkspacesResponse> => {
  const response = await makeRequest<ListUserWorkspacesResponse>({
    path: '/list-user-workspaces',
    method: 'GET',
    workspaceId: ''
  })
  return response
}

export const listUserWorkspacesQuery = (onSuccess?: (data: ListUserWorkspacesResponse) => void) => {
  return createQuery(
    () => ['workspaces'],
    listUserWorkspaces,
    {
      retry: false,
      onSuccess
    }
  )
}

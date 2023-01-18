import type { ListUserWorkspacesResponse } from '@gpt-librarian/services/functions/workspace/types'
import { createQuery } from '@tanstack/solid-query'
const listUserWorkspaces = async (): Promise<ListUserWorkspacesResponse> => {
  const response = await fetch(
    import.meta.env.VITE_REST_URL + '/list-user-workspaces',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
  )
  if (response.status !== 200) {
    throw new Error('Failed to list user workspaces')
  }
  return await response.json()
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

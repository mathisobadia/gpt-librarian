import type { EmbeddingsResponse } from '@gpt-librarian/services/functions/embeddings/types'
import { createQuery } from '@tanstack/solid-query'
import { getAPIUrl } from './utils'

const search = async (
  {
    workspaceId,
    searchQuery
  }:
  { workspaceId: string
    searchQuery: string }
): Promise<EmbeddingsResponse> => {
  const response = await fetch(getAPIUrl('/search', workspaceId) + `&searchquery=${searchQuery}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
  if (response.status !== 200) {
    throw new Error('Failed to list embeddings')
  }
  return await response.json()
}

export const searchQuery = ({ workspaceId, searchQuery, onSuccess }: { workspaceId: string, searchQuery: string, onSuccess?: (res: EmbeddingsResponse) => void }) => {
  return createQuery(() => ['search', async () => await search({ workspaceId, searchQuery })], { onSuccess })
}

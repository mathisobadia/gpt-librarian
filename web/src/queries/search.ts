import type { EmbeddingsResponse } from '@gpt-librarian/services/functions/embeddings/types'
import { createQuery } from '@tanstack/solid-query'
import { makeRequest } from './utils'

const search = async (
  {
    workspaceId,
    searchQuery
  }:
  { workspaceId: string
    searchQuery: string }
): Promise<EmbeddingsResponse> => {
  console.log('searchQuery', searchQuery)
  const response = await makeRequest<EmbeddingsResponse>({
    path: '/search',
    workspaceId,
    method: 'GET',
    searchQuery
  })
  return response
}

export const searchQuery = ({ workspaceId, searchQuery, onSuccess }: { workspaceId: string, searchQuery: string, onSuccess?: (res: EmbeddingsResponse) => void }) => {
  return createQuery(() => ['search', searchQuery], async () => await search({ workspaceId, searchQuery }), { onSuccess })
}

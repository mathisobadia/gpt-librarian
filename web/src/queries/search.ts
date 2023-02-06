import type { EmbeddingsResponse } from '../../../services/functions/embeddings/types'
import { createQuery } from '@tanstack/solid-query'
import { createSignal } from 'solid-js'
import { makeRequest } from './query-utils'

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

export const searchSolidQuery = ({ workspaceId, searchQuery, onSuccess }: { workspaceId: string, searchQuery: string, onSuccess?: (res: EmbeddingsResponse) => void }) => {
  const [query, setQuery] = createSignal(searchQuery)
  const solidQuery = createQuery(() => ['search', query()], async () => await search({ workspaceId, searchQuery: query() }), { onSuccess })
  return { solidQuery, setQuery }
}

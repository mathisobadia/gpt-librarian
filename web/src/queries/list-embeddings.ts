import type { EmbeddingsResponse } from '@gpt-librarian/services/functions/embeddings/types'
import { getAPIUrl } from './utils'

export const listEmbeddings = async (
  workspaceId: string
): Promise<EmbeddingsResponse> => {
  const response = await fetch(getAPIUrl('/list-embeddings', workspaceId), {
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

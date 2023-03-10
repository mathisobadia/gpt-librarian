import type {
  ChatRequest,
  ChatResponse
} from '@gpt-librarian/services/functions/chat/types'
import { makeRequest } from './utils'
export const queryChat = async ({
  query,
  workspaceId,
  language
}: {
  query: string
  workspaceId: string
  language: 'en' | 'fr'
}): Promise<ChatResponse> => {
  const param: ChatRequest = {
    query,
    language
  }
  const response = await makeRequest<ChatResponse>({
    path: '/query-chat',
    workspaceId,
    method: 'POST',
    body: param
  })
  return response
}

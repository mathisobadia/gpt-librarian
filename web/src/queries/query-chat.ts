import type {
  ChatRequest,
  ChatResponse
} from '@gpt-librarian/services/functions/chat/types'
import { makeRequest } from './utils'
export const queryChat = async ({
  query,
  workspaceId
}: {
  query: string
  workspaceId: string
}): Promise<ChatResponse> => {
  const param: ChatRequest = {
    query
  }
  const response = await makeRequest<ChatResponse>({
    path: '/query-chat',
    workspaceId,
    method: 'POST',
    body: param
  })
  return response
}

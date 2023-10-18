import { mapRankedEmbeddings } from '@gpt-librarian/core/embedding'
import { respond, useAuth } from 'functions/event-utils'
import { ApiHandler, useQueryParam } from 'sst/node/api'
import { type APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { type EmbeddingsResponse } from './types'
import { getRankedEmbeddings } from '@gpt-librarian/core/openai'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  const searchQuery = useQueryParam('searchquery') ?? ''
  // const workspaceId = session.properties.userId;
  const embeddings = await getRankedEmbeddings({ workspaceId: member.workspaceId, query: searchQuery, userId: member.userId, embeddingQuantity: 10 })
  const response: EmbeddingsResponse = embeddings.map((embedding) =>
    mapRankedEmbeddings({ ...embedding })
  )
  return respond.ok(response)
})

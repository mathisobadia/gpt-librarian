import { Embedding, mapRankedEmbeddings } from '@gpt-librarian/core/embedding'
import { respond, useAuth } from 'functions/utils'
import { ApiHandler } from '@serverless-stack/node/api'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { EmbeddingsResponse } from './types'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  // const workspaceId = session.properties.userId;
  const embeddings = await Embedding.list(member.workspaceId)
  const response: EmbeddingsResponse = embeddings.map((embedding) =>
    mapRankedEmbeddings({ ...embedding, weight: 0 })
  )
  return respond.ok(response)
})

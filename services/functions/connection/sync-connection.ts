import { Embedding } from '@gpt-librarian/core/embedding'
import { getPageList, savePageEmbeddings } from '@gpt-librarian/core/notion'
import { respond, useAuth, useSafeJsonBody } from 'functions/event-utils'
import { type APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { ApiHandler } from 'sst/node/api'
import { Connection } from '@gpt-librarian/core/connection'
import { syncConnectionInputSchema } from './types'
export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const PAGES_LIMIT = 100
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  const { connectionId } = useSafeJsonBody(syncConnectionInputSchema)
  const connection = await Connection.get(member.workspaceId, connectionId)
  if (!connection) {
    return respond.error('no connection')
  }
  const workspaceId = member.workspaceId
  const notionToken = connection.notionToken
  if (!notionToken) {
    return respond.error('no notion token')
  }
  console.log('notion token', notionToken)
  const pages = await getPageList(notionToken, PAGES_LIMIT)
  console.log(pages)
  for (const page of pages) {
    await deletePreviousEmbeddings(workspaceId, page.id)
    await savePageEmbeddings({
      notionToken,
      workspaceId,
      pageId: page.id,
      connectionId
    })
  }
  return respond.ok('ok')
})

const deletePreviousEmbeddings = async (
  workspaceId: string,
  originId: string
) => {
  const previousEmbeddings = await Embedding.listByOrigin(
    workspaceId,
    'NOTION',
    originId
  )
  const previousEmbeddingIds = previousEmbeddings.map(
    (previousEmbedding) => previousEmbedding.embeddingId
  )
  await Embedding.batchDeleteEmbedding(workspaceId, previousEmbeddingIds)
}

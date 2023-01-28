import { respond, useAuth } from 'functions/utils'
import { ApiHandler } from 'sst/node/api'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { CreateConnectionRequest, CreateConnectionResponse } from './types'
import { createConnection } from '@gpt-librarian/core/notion'
export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  if (!event.body) return respond.error('no body')
  const { type, oauthCode, name }: CreateConnectionRequest = JSON.parse(
    event.body
  )
  if (type === 'NOTION') {
    const connection = await createConnection({
      name,
      code: oauthCode,
      workspaceId: member.workspaceId
    })
    const response: CreateConnectionResponse = connection
    return respond.ok(response)
  }
  return respond.error('invalid type')
  // const workspaceId = session.properties.userId;
})

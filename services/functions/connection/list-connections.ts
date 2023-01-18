import { respond, useAuth } from 'functions/utils'
import { ApiHandler } from '@serverless-stack/node/api'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { Connection } from '@gpt-librarian/core/connection'
import { ListConnectionsResponse } from './types'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  const connections = await Connection.list(member.workspaceId)
  const response: ListConnectionsResponse = connections
  console.log(response)
  return respond.ok(response)
})

import { respond, useAuth } from 'functions/event-utils'
import { ApiHandler } from 'sst/node/api'
import { type APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { Connection } from '@gpt-librarian/core/connection'
import { type ListConnectionsResponse } from './types'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  try {
    const member = await useAuth()
    if (!member) return respond.error('auth error')
    const connections = await Connection.list(member.workspaceId)
    const response: ListConnectionsResponse = connections
    console.log(response)
    return respond.ok(response)
  } catch (error) {
    console.error(error)
    return respond.error(error)
  }
})

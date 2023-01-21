import { respond } from 'functions/utils'
import { ApiHandler } from '@serverless-stack/node/api'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { useSession } from '@serverless-stack/node/auth'
import { Member } from '@gpt-librarian/core/member'
import { Workspace } from '@gpt-librarian/core/workspace'
import { ListUserWorkspacesResponse } from './types'
import { Connection } from '@gpt-librarian/core/connection'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  console.log(event)
  const session = useSession()
  console.log(session)
  if (session.type === 'public') return respond.error('auth error')
  const userId = session.properties.userId
  const members = await Member.listByUser(userId)
  const workspaceIds = members.map((member) => member.workspaceId)
  const connectionPromise = await Promise.all(workspaceIds.map((workspaceId) => ({ workspaceId, connections: Connection.list(workspaceId) })))
  const workspaces = await Workspace.batchGet(workspaceIds)
  const response: ListUserWorkspacesResponse = workspaces.map((workspace) => {
    return {
      workspaceId: workspace.workspaceId,
      name: workspace.name
    }
  })
  return respond.ok(response)
})

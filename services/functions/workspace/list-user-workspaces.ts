import { respond } from 'functions/event-utils'
import { ApiHandler } from 'sst/node/api'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { useSession } from 'sst/node/auth'
import { Workspace } from '@gpt-librarian/core/workspace'
import { ListUserWorkspacesResponse } from './types'
// import { Connection } from '@gpt-librarian/core/connection'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  console.log(event)
  const session = useSession()
  console.log(session)
  if (session.type === 'public') return respond.error('auth error')
  const userId = session.properties.userId
  const { members, users } = await Workspace.getUserCollection(userId)
  const user = users[0]
  const workspaceIds = members.map((member) => member.workspaceId)
  // const connectionPromise = await Promise.all(workspaceIds.map((workspaceId) => ({ workspaceId, connections: Connection.list(workspaceId) })))
  const workspaces = await Workspace.batchGet(workspaceIds)
  console.log(workspaces)
  const response: ListUserWorkspacesResponse = {
    user,
    workspaces: workspaces.map((workspace) => {
      return {
        workspaceId: workspace.workspaceId,
        name: workspace.name
      }
    })
  }
  return respond.ok(response)
})

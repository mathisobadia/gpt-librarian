import { useSession } from 'sst/node/auth'
import { Member } from '@gpt-librarian/core/member'
import { useQueryParam } from 'sst/node/api'
import { Config } from 'sst/node/config'
import { useLambdaContext } from 'sst/context/handler'

/**
 * Hook to return the current user's membership in the workspace, implicitly gets the workspaceId from the query params
 * it caches the result in a map keyed by the request id, so it can be called multiple times in the same request
 */
export const useAuth = async () => {
  const context = useLambdaContext()
  const requestId = context.awsRequestId
  const authMap = new Map<string, Member.MemberEntityType>()
  const cached = authMap.get(requestId)
  if (cached) return cached
  // those hooks use sst context to get the request info anywhere in your code, see https://docs.sst.dev/clients/api#usequeryparam
  const workspaceId = useQueryParam('workspaceId')
  if (!workspaceId) throw new Error('Workspace not specified')
  const session = useSession()
  if (session.type === 'public') throw new Error('User not authenticated')
  const memberships = await Member.listByUser(session.properties.userId)
  const membership = memberships.find(
    (membership) => membership.workspaceId === workspaceId
  )
  if (!membership) throw new Error('User not authorized')
  authMap.set(requestId, membership)
  return membership
}

/**
 * Utility to return a response from an API Gateway handler with a the right status code, JSON body, and CORS headers
 */
export const respond = {
  ok: (response: unknown) => {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(response)
    }
  },
  error: (error: string) => {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(error)
    }
  },
  redirectClearSession: (path: string) => {
    const domainName = Config.DOMAIN_NAME
    const redirect = process.env.IS_LOCAL
      ? `http://localhost:3000${path}`
      : `https://${domainName}${path}`
    return {
      statusCode: 302,
      headers: {
        Location: redirect
      },
      cookies: [
        'auth-token=deleted; HttpOnly; SameSite=None; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      ]
    }
  }
}

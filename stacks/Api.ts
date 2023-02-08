import {
  use,
  StackContext,
  Api as ApiGateway
  , Auth,
  Config
} from 'sst/constructs'
import { Database } from './Database'
import { ConfigStack } from './Config'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
export function Api ({ stack }: StackContext) {
  const table = use(Database)
  const { OPENAI_API_KEY, PINECONE_TOKEN, DOMAIN_NAME, SES_IDENTITY_ARN, NOTION_OAUTH_CLIENT_SECRET, NOTION_OAUTH_CLIENT_ID, BASE_DOMAIN } =
    use(ConfigStack)
  const routes = {
    'POST /sync-connection': {
      type: 'function',
      function: {
        handler: 'services/functions/connection/sync-connection.handler',
        timeout: 10
      }
    },
    'POST /create-connection': {
      type: 'function',
      function: {
        handler: 'services/functions/connection/create-connection.handler',
        timeout: 10
      }
    },
    'GET /list-connections': {
      type: 'function',
      function: {
        handler: 'services/functions/connection/list-connections.handler',
        timeout: 10
      }
    },
    'POST /query-chat': {
      type: 'function',
      function: {
        handler: 'services/functions/chat/query-chat.handler',
        timeout: 30
      }
    },
    'GET /search': {
      type: 'function',
      function: {
        handler: 'services/functions/embeddings/search.handler',
        timeout: 10
      }
    },
    'GET /list-user-workspaces': {
      type: 'function',
      function: {
        handler: 'services/functions/workspace/list-user-workspaces.handler',
        timeout: 10
      }
    },
    'GET /get-workspace': {
      type: 'function',
      function: {
        handler: 'services/functions/workspace/get-workspace.handler',
        timeout: 10
      }
    }
  } as const
  const api = new ApiGateway(stack, 'api', {
    defaults: {
      function: {
        bind: [
          table,
          OPENAI_API_KEY,
          PINECONE_TOKEN,
          DOMAIN_NAME,
          SES_IDENTITY_ARN,
          NOTION_OAUTH_CLIENT_SECRET,
          NOTION_OAUTH_CLIENT_ID,
          BASE_DOMAIN
        ],
        timeout: 10
      }
    },
    cors: {
      allowHeaders: ['content-type', 'authorization'],
      allowMethods: ['ANY'],
      // TODO: restrict this to the frontend URL
      // allowOrigins: ['http://localhost:3000', `https://${DOMAIN_NAME.value}`, 'https://gpt-librarian.com']
      allowOrigins: ['*']
    },
    routes
  })
  const auth = new Auth(stack, 'auth', {
    authenticator: {
      handler: 'services/functions/auth/auth.handler',
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['ses:SendEmail'],
          resources: ['*']
        })
      ]
    }
  })

  auth.attach(stack, {
    api,
    prefix: '/auth' // optional
  })

  stack.addOutputs({
    API: api.url
  })

  api.bind([table])

  const param = new Config.Parameter(stack, 'API_URL', {
    value: api.url
  })
  return { api, param }
}

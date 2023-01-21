import {
  use,
  StackContext,
  Api as ApiGateway,
} from "@serverless-stack/resources";
import { Database } from "./Database";
import { ConfigStack } from "./Config";
import { Auth } from "@serverless-stack/resources";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
export function Api({ stack }: StackContext) {
  const table = use(Database);
  const { OPENAI_API_KEY, PINECONE_TOKEN, DOMAIN_NAME, SES_IDENTITY_ARN, NOTION_OAUTH_CLIENT_SECRET, NOTION_OAUTH_CLIENT_ID, BASE_DOMAIN } =
    use(ConfigStack);
  const routes = {
    "POST /sync-connection": {
      type: "function",
      function: {
        handler: "functions/connection/sync-connection.handler",
        timeout: 300,
      },
    },
    "POST /create-connection": {
      type: "function",
      function: {
        handler: "functions/connection/create-connection.handler",
        timeout: 3,
      },
    },
    "POST /list-connections": {
      type: "function",
      function: {
        handler: "functions/connection/list-connections.handler",
        timeout: 3,
      },
    },
    "POST /query-chat": {
      type: "function",
      function: {
        handler: "functions/chat/query-chat.handler",
        timeout: 30,
      },
    },
    "POST /logout": {
      type: "function",
      function: {
        handler: "functions/auth/logout.handler",
        timeout: 3,
      },
    },
    "GET /search": {
      type: "function",
      function: {
        handler: "functions/embeddings/search.handler",
        timeout: 10,
      },
    },
    "GET /list-user-workspaces": {
      type: "function",
      function: {
        handler: "functions/workspace/list-user-workspaces.handler",
        timeout: 3,
      },
    },
    "GET /get-workspace": {
      type: "function",
      function: {
        handler: "functions/workspace/get-workspace.handler",
        timeout: 3,
      },
    },
  } as const;
  const api = new ApiGateway(stack, "api", {
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
      },
    },
    cors: {
      allowCredentials: true,
      allowHeaders: ["content-type"],
      allowMethods: ["ANY"],
      // TODO: restrict this to the frontend URL
      allowOrigins: ["http://localhost:3000", `https://${DOMAIN_NAME.value}`],
      // allowOrigins: ["*"],
    },
    routes: routes,
  });
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "functions/auth/auth.handler",
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["ses:SendEmail"],
          resources: ["*"],
        }),
      ],
    },
  });

  auth.attach(stack, {
    api: api,
    prefix: "/auth", // optional
  });

  stack.addOutputs({
    API: api.url,
  });

  return api;
}

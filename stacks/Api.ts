import {
  use,
  StackContext,
  Api as ApiGateway,
} from "@serverless-stack/resources";
import { Database } from "./Database";
import { ConfigStack } from "./Config";
import { Auth } from "@serverless-stack/resources";

export function Api({ stack }: StackContext) {
  const table = use(Database);
  const { NOTION_TOKEN, OPENAI_API_KEY, PINECONE_TOKEN } = use(ConfigStack);

  const api = new ApiGateway(stack, "api", {
    defaults: {
      function: {
        bind: [table, NOTION_TOKEN, OPENAI_API_KEY, PINECONE_TOKEN],
      },
    },
    routes: {
      "POST /notion": {
        type: "function",
        function: {
          handler: "functions/notion/notion.handler",
          timeout: 300,
        },
      },
      "POST /chat": {
        type: "function",
        function: {
          handler: "functions/chat/chat.handler",
          timeout: 30,
        },
      },
      "GET /embeddings": {
        type: "function",
        function: {
          handler: "functions/embeddings/embeddings.handler",
          timeout: 10,
        },
      },
    },
  });

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "functions/auth.handler",
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

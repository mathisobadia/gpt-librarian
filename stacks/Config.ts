import { Config, StackContext } from "@serverless-stack/resources";

export function ConfigStack({ stack }: StackContext) {
  const OPENAI_API_KEY = new Config.Secret(stack, "OPENAI_API_KEY");
  const PINECONE_TOKEN = new Config.Secret(stack, "PINECONE_TOKEN");
  const BASE_DOMAIN = new Config.Parameter(stack, "BASE_DOMAIN", {
    value: "app.gpt-librarian.com",
  });
  const stage = stack.stage;
  const domainName =
    stack.stage === "prod"
      ? BASE_DOMAIN.value
      : `${stage}.${BASE_DOMAIN.value}`;
  const DOMAIN_NAME = new Config.Parameter(stack, "DOMAIN_NAME", {
    value: domainName,
  });
  return { OPENAI_API_KEY, PINECONE_TOKEN, DOMAIN_NAME, BASE_DOMAIN };
}

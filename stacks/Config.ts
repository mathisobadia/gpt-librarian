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
  // Made the mistake of using the wrong region here, so I need to hard code the region here.
  const SES_IDENTITY_ARN = new Config.Parameter(stack, "SES_IDENTITY_ARN", {
    value: `arn:aws:ses:us-east-1:${stack.account}:identity/gpt-librarian.com`,
  });
  return {
    OPENAI_API_KEY,
    PINECONE_TOKEN,
    DOMAIN_NAME,
    BASE_DOMAIN,
    SES_IDENTITY_ARN,
  };
}

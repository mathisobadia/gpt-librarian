import { Config, StackContext } from "@serverless-stack/resources";

export function ConfigStack({ stack }: StackContext) {
  const NOTION_TOKEN = new Config.Secret(stack, "NOTION_TOKEN");
  const OPENAI_API_KEY = new Config.Secret(stack, "OPENAI_API_KEY");
  const PINECONE_TOKEN = new Config.Secret(stack, "PINECONE_TOKEN");
  return { NOTION_TOKEN, OPENAI_API_KEY, PINECONE_TOKEN };
}

import { use, StackContext, StaticSite } from "@serverless-stack/resources";
import { Api } from "./Api";

export function Web({ stack }: StackContext) {
  const api = use(Api);

  const site = new StaticSite(stack, "site", {
    path: "web",
    buildCommand: "npm run build",
    buildOutput: "dist",
    environment: {
      VITE_REST_URL: api.url,
    },
  });

  stack.addOutputs({
    SITE: site.url,
  });
}

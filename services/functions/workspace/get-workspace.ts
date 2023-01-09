import { respond, useAuth } from "functions/utils";
import { ApiHandler } from "@serverless-stack/node/api";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Workspace } from "@gpt-workspace-search/core/workspace";

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth();
  if (!member) return respond.error("auth error");
  const workspaceId = member.userId;
  const workspace = await Workspace.get(workspaceId);
  return respond.ok(workspace);
});

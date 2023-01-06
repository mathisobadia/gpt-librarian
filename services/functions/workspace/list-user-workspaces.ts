import { respond } from "functions/utils";
import { ApiHandler } from "@serverless-stack/node/api";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { useSession } from "@serverless-stack/node/auth";
import { Member } from "@gpt-workspace-search/core/member";

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  console.log(event);
  const session = useSession();
  if (session.type === "public") return respond.error("auth error");
  const userId = session.properties.userId;
  const members = await Member.listByUser(userId);
  const workspaceIds = members.map((member) => member.workspaceId);
  return respond.ok(workspaceIds);
});

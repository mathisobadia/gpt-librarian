import { useSession } from "@serverless-stack/node/auth";
import { Member } from "@gpt-workspace-search/core/member";
import { APIGatewayProxyEventV2 } from "aws-lambda";
export const useAuth = async (event: APIGatewayProxyEventV2) => {
  const workspaceId = event.queryStringParameters?.workspaceId;
  if (!workspaceId) throw new Error("Workspace not specified");
  const session = useSession();
  if (session.type === "public") throw new Error("User not authenticated");
  const memberships = await Member.listByUser(session.properties.userId);
  const membership = memberships.find(
    (membership) => membership.workspaceId === workspaceId
  );
  if (!membership) throw new Error("User not authorized");
  return membership;
};

export const respond = {
  ok: async (response: unknown) => {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(response),
    };
  },
  error: async (error: string) => {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(error),
    };
  },
};

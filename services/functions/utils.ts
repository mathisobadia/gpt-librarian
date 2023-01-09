import { useSession } from "@serverless-stack/node/auth";
import { Member } from "@gpt-workspace-search/core/member";
import { useQueryParam } from "@serverless-stack/node/api";

/**
 * Hook to return the current user's membership in the workspace, implicitly gets the workspaceId from the query params
 */
export const useAuth = async () => {
  // those hooks use sst context to get the request info anywhere in your code, see https://docs.sst.dev/clients/api#usequeryparam
  const workspaceId = useQueryParam("workspaceId");
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

/**
 * Utility to return a response from an API Gateway handler with a the right status code, JSON body, and CORS headers
 */
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

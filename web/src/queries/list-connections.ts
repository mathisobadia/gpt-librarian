import { ListConnectionsResponse } from "@gpt-workspace-search/services/functions/connection/types";
import { getAPIUrl } from "./utils";

export const listConnections = async (
  workspaceId: string
): Promise<ListConnectionsResponse> => {
  const response = await fetch(getAPIUrl("/list-connections", workspaceId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    credentials: "include",
  });
  return response.json();
};

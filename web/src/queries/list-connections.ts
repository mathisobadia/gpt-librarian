import { ListConnectionsResponse } from "@gpt-librarian/services/functions/connection/types";
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
  if (response.status !== 200) {
    throw new Error("Failed to list connections");
  }
  return response.json();
};

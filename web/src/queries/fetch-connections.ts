import { getAPIUrl } from "./utils";

export const fetchConnections = async (
  workspaceId: string
): Promise<string> => {
  const response = await fetch(getAPIUrl("/fetch-connections", workspaceId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    credentials: "include",
  });
  if (response.status !== 200) {
    throw new Error("Failed to fetch connections");
  }
  return response.json();
};

import type {
  CreateConnectionRequest,
  CreateConnectionResponse,
} from "@gpt-workspace-search/services/functions/connection/types";
import { getAPIUrl } from "./utils";

export const createConnection = async (
  params: CreateConnectionRequest & { workspaceId: string }
): Promise<CreateConnectionResponse> => {
  const response = await fetch(
    getAPIUrl("/create-connection", params.workspaceId),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    }
  );
  return response.json();
};

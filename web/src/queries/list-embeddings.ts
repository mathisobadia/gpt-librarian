import type { EmbeddingsResponse } from "@gpt-workspace-search/services/functions/embeddings/types";
import { getAPIUrl } from "./utils";

export const listEmbeddings = async (
  workspaceId: string
): Promise<EmbeddingsResponse> => {
  const response = await fetch(getAPIUrl("/list-embeddings", workspaceId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return response.json();
};

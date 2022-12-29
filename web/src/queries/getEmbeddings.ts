import type { EmbeddingsResponse } from "@gpt-workspace-search/services/functions/embeddings/types";

export const getEmbeddings = async (): Promise<EmbeddingsResponse> => {
  const response = await fetch(import.meta.env.VITE_REST_URL + "/embeddings", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

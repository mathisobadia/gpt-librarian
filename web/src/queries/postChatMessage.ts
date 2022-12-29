import type {
  ChatRequest,
  ChatResponse,
} from "@gpt-workspace-search/services/functions/chat/types";
export const postChatMessage = async (query: string): Promise<ChatResponse> => {
  console.log(query);
  const param: ChatRequest = {
    query,
  };
  const response = await fetch(import.meta.env.VITE_REST_URL + "/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });
  return response.json();
};

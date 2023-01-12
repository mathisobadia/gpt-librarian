import type {
  ChatRequest,
  ChatResponse,
} from "@gpt-librarian/services/functions/chat/types";
import { getAPIUrl } from "./utils";
export const queryChat = async ({
  query,
  workspaceId,
}: {
  query: string;
  workspaceId: string;
}): Promise<ChatResponse> => {
  console.log(query);
  const param: ChatRequest = {
    query,
  };
  const response = await fetch(getAPIUrl("/query-chat", workspaceId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
    credentials: "include",
  });
  return response.json();
};

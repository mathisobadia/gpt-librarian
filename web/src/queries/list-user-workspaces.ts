import type { ListUserWorkspacesResponse } from "@gpt-librarian/services/functions/workspace/types";
export const listUserWorkspaces =
  async (): Promise<ListUserWorkspacesResponse> => {
    const response = await fetch(
      import.meta.env.VITE_REST_URL + "/list-user-workspaces",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (response.status !== 200) {
      throw new Error("Failed to list user workspaces");
    }
    return response.json();
  };

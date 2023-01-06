export const listUserWorkspaces = async (): Promise<string[]> => {
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
  return response.json();
};

export const postNotion = async (): Promise<string> => {
  const response = await fetch(import.meta.env.VITE_REST_URL + "/notion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  return response.json();
};

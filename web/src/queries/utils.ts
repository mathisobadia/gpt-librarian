export const getAPIUrl = (path: string, workspaceId: string): string => {
  //   const workspaceId = params.workspaceId;
  const urlParams = new URLSearchParams({ workspaceId });
  return `${import.meta.env.VITE_REST_URL}${path}?${urlParams.toString()}`;
};

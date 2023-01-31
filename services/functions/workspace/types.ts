export type ListUserWorkspacesResponse = {
  user: {
    userId: string
    email: string
    name: string
  }
  workspaces: WorkspaceResponse[]
}

export type WorkspaceResponse = {
  workspaceId: string
  name: string
}

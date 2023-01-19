export type CreateConnectionRequest = {
  type: 'NOTION'
  oauthCode: string
  name?: string
}

export type CreateConnectionResponse = {
  connectionId: string
  workspaceId: string
  type: 'NOTION'
  name: string
  createdAt: string
  lastSyncedAt?: string
}

export type ListConnectionsResponse = CreateConnectionResponse[]

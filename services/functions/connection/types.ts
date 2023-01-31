import { z } from 'zod'

export type CreateConnectionRequest = z.infer<typeof createConnectionInputSchema>

export const createConnectionInputSchema = z.object({
  type: z.enum(['NOTION']),
  oauthCode: z.string(),
  name: z.string().optional()
})

export type CreateConnectionResponse = {
  connectionId: string
  workspaceId: string
  type: 'NOTION'
  name: string
  createdAt: string
  lastSyncedAt?: string
}

export const syncConnectionInputSchema = z.object({
  connectionId: z.string()
})

export type SyncConnectionRequest = {
  connectionId: string
}

export type ListConnectionsResponse = CreateConnectionResponse[]

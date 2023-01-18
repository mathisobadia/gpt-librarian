import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as Connection from './connection'

export const ConnectionEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Connection',
      service: 'connection'
    },
    attributes: {
      connectionId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      workspaceId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      type: {
        type: ['NOTION'] as const,
        required: true,
        readOnly: true
      },
      name: {
        type: 'string'
      },
      notionToken: {
        type: 'string'
      },
      createdAt: { type: 'string', required: true, readOnly: true },
      updatedAt: { type: 'string', required: true, readOnly: false }
    },
    indexes: {
      primary: {
        pk: {
          field: 'pk',
          composite: ['workspaceId']
        },
        sk: {
          field: 'sk',
          composite: ['connectionId']
        }
      },
      byType: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['type']
        },
        sk: {
          field: 'gsi1sk',
          composite: ['connectionId']
        }
      }
    }
  },
  Dynamo.Configuration
)

export type ConnectionEntityType = EntityItem<typeof ConnectionEntity>

export const list = async (workspaceId: string) => {
  const result = await ConnectionEntity.query
    .primary({
      workspaceId
    })
    .go()
  return result.data
}

export const listByType = async (type: 'NOTION') => {
  const result = await ConnectionEntity.query
    .byType({
      type
    })
    .go()
  return result.data
}

export const create = async ({
  workspaceId,
  type,
  notionToken,
  name
}: {
  workspaceId: string
  type: 'NOTION'
  notionToken: string
  name?: string
}) => {
  const connectionId = ulid()
  const connection = await ConnectionEntity.create({
    connectionId,
    workspaceId,
    notionToken,
    type,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).go()
  return connection.data
}

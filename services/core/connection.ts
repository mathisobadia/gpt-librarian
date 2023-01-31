import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as Connection from './connection'

export const ConnectionEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Connection',
      service: 'workspace'
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
        required: true,
        type: 'string'
      },
      notionToken: {
        type: 'string'
      },
      additionalNotionInfo: {
        type: 'any'
      },
      createdAt: { type: 'string', required: true, readOnly: true },
      updatedAt: { type: 'string', required: true, readOnly: false }
    },
    indexes: {
      byWorkspace: {
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
      },
      workspaceCollection: {
        index: 'gsi2',
        collection: 'workspace',
        pk: {
          field: 'gsi2pk',
          composite: ['workspaceId']
        },
        sk: {
          field: 'gsi2sk',
          composite: []
        }
      }
    }
  },
  Dynamo.Configuration
)

export type ConnectionEntityType = EntityItem<typeof ConnectionEntity>

export const list = async (workspaceId: string) => {
  const result = await ConnectionEntity.query
    .byWorkspace({
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

export const get = async (workspaceId: string, connectionId: string) => {
  const result = await ConnectionEntity.get({
    workspaceId,
    connectionId
  }).go()
  return result.data
}

export const create = async ({
  workspaceId,
  type,
  notionToken,
  name,
  additionalNotionInfo
}: {
  workspaceId: string
  type: 'NOTION'
  notionToken: string
  name: string
  additionalNotionInfo?: any
}) => {
  const connectionId = ulid()
  const connection = await ConnectionEntity.create({
    connectionId,
    workspaceId,
    notionToken,
    type,
    name,
    additionalNotionInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).go()
  return connection.data
}

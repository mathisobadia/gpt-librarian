import { ulid } from 'ulid'
import { Entity, type EntityItem, Service } from 'electrodb'
import { Dynamo } from './dynamo'
import { ConnectionEntity } from './connection'
import { MemberEntity } from './member'
import { UserEntity } from './user'
export * as Workspace from './workspace'

export const WorkspaceEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Workspace',
      service: 'workspace'
    },
    attributes: {
      organizationId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      name: {
        type: 'string',
        required: true
      },
      workspaceId: {
        type: 'string',
        required: true,
        readOnly: true
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
          composite: []
        }
      },
      byOrganization: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['organizationId']
        },
        sk: {
          field: 'gsi1sk',
          composite: ['createdAt']
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

const workspaceService = new Service({
  workspaces: WorkspaceEntity,
  connections: ConnectionEntity,
  members: MemberEntity,
  users: UserEntity
})

export type WorkspaceEntityType = EntityItem<typeof WorkspaceEntity>

export const list = async (organizationId: string) => {
  const result = await WorkspaceEntity.query
    .byOrganization({
      organizationId
    })
    .go()
  return result.data
}

export const create = async (organizationId: string, name: string) => {
  const workspaceId = ulid()
  const result = await WorkspaceEntity.create({
    organizationId,
    workspaceId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).go()
  return result.data
}

export const get = async (workspaceId: string) => {
  const result = await WorkspaceEntity.get({
    workspaceId
  }).go()
  return result.data
}

export const batchGet = async (workspaceIds: string[]) => {
  const result = await WorkspaceEntity.get(
    workspaceIds.map((id) => ({ workspaceId: id }))
  ).go()
  return result.data
}

export const getWorkspaceCollection = async (workspaceId: string) => {
  const result = await workspaceService.collections.workspace({ workspaceId }).go()
  return result.data
}

export const getUserCollection = async (userId: string) => {
  const result = await workspaceService.collections.user({ userId }).go()
  return result.data
}

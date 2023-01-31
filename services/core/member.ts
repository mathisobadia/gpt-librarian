import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as Member from './member'

export const MemberEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Member',
      service: 'workspace'
    },
    attributes: {
      workspaceId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      memberId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      role: {
        type: ['ADMIN', 'MEMBER']
      },
      userId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      invitedEmail: {
        type: 'string'
      },
      invitedName: {
        type: 'string'
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
          composite: ['memberId']
        }
      },
      userCollection: {
        index: 'gsi1',
        collection: 'user',
        pk: {
          field: 'gsi1pk',
          composite: ['userId']
        },
        sk: {
          field: 'gsi1sk',
          composite: []
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

export type MemberEntityType = EntityItem<typeof MemberEntity>

export const create = async ({
  workspaceId,
  userId,
  invitedEmail,
  invitedName,
  role
}: {
  workspaceId: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  invitedEmail?: string
  invitedName?: string
}) => {
  const memberId = ulid()
  const member = await MemberEntity.put({
    workspaceId,
    memberId,
    userId,
    invitedEmail,
    invitedName,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).go()
  return member.data
}

export const list = async (workspaceId: string) => {
  const result = await MemberEntity.query
    .byWorkspace({
      workspaceId
    })
    .go()
  return result.data
}

export const listByUser = async (userId: string) => {
  const result = await MemberEntity.query
    .userCollection({
      userId
    })
    .go()
  return result.data
}

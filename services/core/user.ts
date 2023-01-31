import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as User from './user'

export const UserEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'User',
      service: 'workspace'
    },
    attributes: {
      userId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      email: {
        type: 'string',
        required: true
      },
      name: {
        type: 'string',
        required: true
      }
    },
    indexes: {
      primary: {
        pk: {
          field: 'pk',
          composite: ['userId']
        },
        sk: {
          field: 'sk',
          composite: []
        }
      },
      userCollection: {
        collection: 'user',
        pk: {
          field: 'pk',
          composite: ['userId']
        },
        sk: {
          field: 'sk',
          composite: []
        }
      },
      byMail: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['email']
        },
        sk: {
          field: 'gsi1sk',
          composite: []
        }
      }
    }
  },
  Dynamo.Configuration
)

export type UserEntityType = EntityItem<typeof UserEntity>

type CreateUserInput = {
  email: string
  name: string
}
export async function create (input: CreateUserInput) {
  const result = await UserEntity.create({
    userId: ulid(),
    email: input.email,
    name: input.name
  }).go()
  return result.data
}

export async function getByEmail (email: string) {
  const result = await UserEntity.query.byMail({ email }).go()
  if (result.data.length === 0) {
    return null
  }
  return result.data[0]
}

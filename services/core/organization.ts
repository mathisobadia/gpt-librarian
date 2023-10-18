import { ulid } from 'ulid'
import { Entity, type EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as Organization from './organization'

export const OrganizationEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Organization',
      service: 'workspace'
    },
    attributes: {
      organizationId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      name: {
        type: 'string'
      },
      createdAt: { type: 'string', required: true, readOnly: true },
      updatedAt: { type: 'string', required: true, readOnly: false }
    },
    indexes: {
      primary: {
        pk: {
          field: 'pk',
          composite: ['organizationId']
        },
        sk: {
          field: 'sk',
          composite: []
        }
      }
    }
  },
  Dynamo.Configuration
)

export type OrganizationEntityType = EntityItem<typeof OrganizationEntity>

export const create = async ({ name }: { name?: string }) => {
  const organizationId = ulid()
  const organization = await OrganizationEntity.create({
    organizationId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).go()
  return organization.data
}

export const get = async (organizationId: string) => {
  const organization = await OrganizationEntity.get({
    organizationId
  }).go()
  return organization.data
}

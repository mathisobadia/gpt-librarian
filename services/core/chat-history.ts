import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
export * as ChatHistory from './chat-history'

export const ChatHistoryEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'ChatHistory',
      service: 'history'
    },
    attributes: {
      chatHistoryId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      query: {
        type: 'string',
        required: true,
        readOnly: true
      },
      response: {
        type: 'string',
        required: true,
        readOnly: true
      },
      answerFound: {
        type: 'boolean',
        required: true,
        readOnly: true
      },
      userSatisfaction: {
        type: ['OK', 'NOT_OK']
      },
      workspaceId: { type: 'string', required: true, readOnly: true },
      memberId: { type: 'string', required: true, readOnly: true },
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
          composite: ['chatHistoryId']
        }
      },
      byMember: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['memberId']
        },
        sk: {
          field: 'gsi1sk',
          composite: ['createdAt']
        }
      },
      byOrganization: {
        index: 'gsi2',
        pk: {
          field: 'gsi2pk',
          composite: ['workspaceId'],
          sk: {
            field: 'gsi2sk',
            composite: ['createdAt']
          }
        }
      }
    }
  },
  Dynamo.Configuration
)

export type ChatHistoryEntityType = EntityItem<typeof ChatHistoryEntity>

export const list = async (workspaceId: string) => {
  const result = await ChatHistoryEntity.query.byWorkspace({ workspaceId }).go()
  return result.data
}

/*
Check rate limit openai API, this is required to get aproval from Openai
and is a good thing to include anyway as they costs can go up pretty fast
We check in chat history the last requests made in the last minute
*/
export const isRateLimitExceeded = async (memberId: string) => {
  const rateLimit = 10
  const dateAMinuteAgo = new Date()
  dateAMinuteAgo.setMinutes(dateAMinuteAgo.getMinutes() - 1)
  const lastRequest = await listByUser({
    memberId,
    fromDate: dateAMinuteAgo
  })
  console.log(lastRequest)
  if (!lastRequest) return false
  return lastRequest.length > rateLimit
}

export const listByUser = async ({
  memberId,
  fromDate
}: {
  memberId: string
  fromDate?: Date
}) => {
  const result = await ChatHistoryEntity.query
    .byMember({ memberId })
    .gte({
      createdAt: fromDate ? fromDate.toISOString() : undefined
    })
    .go()
  return result.data
}

export const create = async (params: {
  query: string
  response: string
  answerFound: boolean
  workspaceId: string
  memberId: string
}) => {
  const { query, response, answerFound, workspaceId, memberId } = params
  const chatHistoryId = ulid()
  const now = new Date().toISOString()
  const result = await ChatHistoryEntity.put({
    chatHistoryId,
    query,
    response,
    answerFound,
    workspaceId,
    memberId,
    createdAt: now,
    updatedAt: now
  }).go()
  return result.data
}

export const update = async (params: {
  chatHistoryId: string
  userSatisfaction: 'OK' | 'NOT_OK'
  workspaceId: string
}) => {
  const { chatHistoryId, userSatisfaction, workspaceId } = params
  const now = new Date().toISOString()
  const result = await ChatHistoryEntity.patch({
    workspaceId,
    chatHistoryId
  })
    .set({
      userSatisfaction,
      updatedAt: now
    })
    .go()
  return result.data
}

export const remove = async (params: {
  chatHistoryId: string
  workspaceId: string
}) => {
  const { chatHistoryId, workspaceId } = params
  const result = await ChatHistoryEntity.delete({
    workspaceId,
    chatHistoryId
  }).go()
  return result.data
}

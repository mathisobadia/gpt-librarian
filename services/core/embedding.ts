import { ulid } from 'ulid'
import { Entity, EntityItem } from 'electrodb'
import { Dynamo } from './dynamo'
import {
  batchCreatePineconeEmbedding,
  batchDeletePineconeEmbedding
} from './pinecone'
import { WeightedEmbedding } from './openai'
import { EmbeddingResponse } from 'functions/embeddings/types'
export * as Embedding from './embedding'

export const EmbeddingEntity = new Entity(
  {
    model: {
      version: '1',
      entity: 'Embedding',
      service: 'embedding'
    },
    attributes: {
      embeddingId: {
        type: 'string',
        required: true,
        readOnly: true
      },
      text: {
        type: 'map',
        required: true,
        properties: {
          context: { type: 'string', required: true },
          content: { type: 'string', required: true }
        }
      },
      workspaceId: { type: 'string', required: true, readOnly: true },
      originType: {
        type: ['NOTION'],
        required: true,
        readOnly: true
      },
      connectionId: { type: 'string', required: true, readOnly: true },
      originId: { type: 'string', required: true },
      originLink: {
        type: 'map',
        properties: {
          url: { type: 'string', required: true },
          text: { type: 'string', required: true }
        },
        required: true
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
          composite: ['embeddingId']
        }
      },
      origin: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['originType', 'originId']
        },
        sk: {
          field: 'gsi1sk',
          composite: ['createdAt']
        }
      }
    }
  },
  Dynamo.Configuration
)

export type EmbeddingEntityType = EntityItem<typeof EmbeddingEntity>

export type CreateEmbeddingInput = Pick<
EmbeddingEntityType,
'text' | 'originId' | 'workspaceId' | 'originLink' | 'connectionId'
> & { ada002: number[] }
// export async function create(input : CreateEmbeddingInput) {
//   const result = await EmbeddingEntity.create(embeddingInputToEmbedding(input)).go();
//   return result.data;
// }
const embeddingInputToEmbedding = ({
  ada002,
  text,
  originId,
  workspaceId,
  originLink,
  connectionId
}: CreateEmbeddingInput) => ({
  embeddingId: ulid(),
  ada002,
  text,
  originId,
  originType: 'NOTION',
  workspaceId,
  originLink,
  connectionId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const embeddingInputToPineconeEmbedding = ({
  ada002,
  embeddingId,
  workspaceId
}: EmbeddingEntityType & {
  ada002: number[]
}) => ({
  id: embeddingId,
  values: ada002,
  namespace: workspaceId,
  metadata: {
    originType: 'NOTION'
  }
})

export const batchCreateEmbedding = async (
  embeddingInputs: CreateEmbeddingInput[]
) => {
  const embeddings = embeddingInputs.map(embeddingInputToEmbedding)
  const pineconeInputs = embeddings.map(embeddingInputToPineconeEmbedding)
  const dynamoInputs = embeddings.map((embedding) => {
    const { ada002, ...rest } = embedding
    return rest
  })
  if (embeddings.length === 0) {
    return []
  }
  await batchCreatePineconeEmbedding(embeddings[0].workspaceId, pineconeInputs)
  const result = await EmbeddingEntity.put(dynamoInputs).go()
  return result
}

export const batchDeleteEmbedding = async (
  workspaceId: string,
  embeddingIds: string[]
) => {
  const embeddingInputs = embeddingIds.map((embeddingId) => ({
    workspaceId,
    embeddingId
  }))
  if (embeddingInputs.length === 0) {
    return []
  }
  const result = await EmbeddingEntity.delete(embeddingInputs).go()
  const pineconeInputs = embeddingInputs.map(
    (embeddingInput) => embeddingInput.embeddingId
  )
  await batchDeletePineconeEmbedding(workspaceId, pineconeInputs)
  return result
}

export const batchGetEmbeddings = async (
  workspaceId: string,
  embeddingIds: string[]
) => {
  const embeddingInputs = embeddingIds.map((embeddingId) => ({
    workspaceId,
    embeddingId
  }))
  const result = await EmbeddingEntity.get(embeddingInputs).go()
  return result.data
}

export const list = async (workspaceId: string) => {
  const result = await EmbeddingEntity.query.primary({ workspaceId }).go()
  return result.data
}

export const listByOrigin = async (
  workspaceId: string,
  originType: string,
  originId: string
) => {
  const result = await EmbeddingEntity.query
    .origin({ workspaceId, originType, originId })
    .go({
      pages: 'all'
    })
  return result.data
}

export const getFullTextEmbedding = (text: EmbeddingEntityType['text']) => {
  return `${text.context}\n${text.content}`
}

export const mapRankedEmbeddings = (
  embedding: WeightedEmbedding
): EmbeddingResponse => {
  return {
    textContent: embedding.text.content,
    originLink: embedding.originLink
  }
}

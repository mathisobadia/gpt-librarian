import { PineconeClient } from 'pinecone-client'
import { Config } from 'sst/node/config'
// TODO: delete this when upgrading to node 18
import 'cross-fetch/polyfill'

// Initializing a client

// A type representing your metadata
type Metadata = {
  originType: string
}

const getPineconeClient = (worspaceId: string) => {
  const pinecone = new PineconeClient<Metadata>({
    apiKey: Config.PINECONE_TOKEN,
    baseUrl: 'https://mathisobadia-583af9c.svc.us-west1-gcp.pinecone.io',
    namespace: worspaceId
  })
  return pinecone
}

type PineconeEmbedding = {
  id: string
  values: number[]
  metadata: Metadata
}
export const batchCreatePineconeEmbedding = async (
  worspaceId: string,
  embeddings: PineconeEmbedding[]
) => {
  const pinecone = getPineconeClient(worspaceId)
  await pinecone.upsert({ vectors: embeddings })
}

export const batchDeletePineconeEmbedding = async (
  worspaceId: string,
  embeddingIds: string[]
) => {
  if (embeddingIds.length === 0) {
    return []
  }
  const pinecone = getPineconeClient(worspaceId)
  await pinecone.delete({ ids: embeddingIds })
}

export const queryEmbeddings = async (
  workspaceId: string,
  ada002: number[],
  embeddingQuantity: number
) => {
  const pinecone = getPineconeClient(workspaceId)
  const result = await pinecone.query({
    vector: ada002,
    topK: embeddingQuantity
  })
  return result.matches
}

import { EmbeddingResponse } from '../embeddings/types'

export type ChatRequest = {
  query: string
}

export type ChatResponse = {
  completion: string | undefined
  rankedEmbeddings: EmbeddingResponse[]
}

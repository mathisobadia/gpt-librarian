import { EmbeddingResponse } from '../embeddings/types'

export type ChatRequest = {
  query: string
  language: 'en' | 'fr'
}

export type ChatResponse = {
  completion: string | undefined
  rankedEmbeddings: EmbeddingResponse[]
}

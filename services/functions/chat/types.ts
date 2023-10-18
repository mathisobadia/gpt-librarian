import { z } from 'zod'
import { type EmbeddingResponse } from '../embeddings/types'

export type ChatRequest = z.infer<typeof queryChatSchema>

export const queryChatSchema = z.object({
  query: z.string(),
  language: z.enum(['en', 'fr'])
})

export type ChatResponse = {
  completion: string | undefined
  rankedEmbeddings: EmbeddingResponse[]
}

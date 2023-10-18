import { respond, useSafeJsonBody } from '../event-utils'
import {
  getChatAnswer
} from '@gpt-librarian/core/openai'
import { type APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { type ChatResponse, queryChatSchema } from './types'
import { ApiHandler } from 'sst/node/api'
import { useAuth } from 'functions/event-utils'
import * as p from 'promptable'
export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  try {
    const member = await useAuth()
    if (!member) return respond.error('auth error')
    if (!event.body) return respond.error('no body')
    const { query, language } = useSafeJsonBody(queryChatSchema)
    const { memberId, userId, workspaceId } = member
    const response: ChatResponse = await getChatAnswer({
      query,
      language,
      workspaceId,
      userId,
      memberId
    })
    return respond.ok(response)
  } catch (error) {
    console.error(error)
    return respond.error(error)
  }
})

const test = async () => {
  const openai = new p.OpenAI('TOKEN')

  const writePoemPrompt = new p.Prompt(
    // your instructions go here
    'Write a poem about {{topic}}:'.trim(),
    [
      // variable names go here
      'topic'
    ]
  )
  const text = writePoemPrompt.format({

  })

  const tokensUsed = openai.countTokens(text)

  const response = await openai.generate(text)
}

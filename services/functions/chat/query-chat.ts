import { respond } from '../utils'
import {
  getChatAnswer
} from '@gpt-librarian/core/openai'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { ChatRequest, ChatResponse } from './types'
import { ApiHandler, useJsonBody } from '@serverless-stack/node/api'
import { useAuth } from 'functions/utils'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  if (!event.body) return respond.error('no body')
  const { query, language }: ChatRequest = useJsonBody()
  const { memberId, userId, workspaceId } = member
  const response: ChatResponse = await getChatAnswer({
    query,
    language,
    workspaceId,
    userId,
    memberId
  })
  return respond.ok(response)
})

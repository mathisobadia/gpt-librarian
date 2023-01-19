import { respond } from '../utils'
import {
  getRankedEmbeddings,
  createPrompt,
  createCompletion
} from '@gpt-librarian/core/openai'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { ChatRequest, ChatResponse } from './types'
import { mapRankedEmbeddings } from '@gpt-librarian/core/embedding'
import { ApiHandler } from '@serverless-stack/node/api'
import { useAuth } from 'functions/utils'
import { ChatHistory } from '@gpt-librarian/core/chat-history'

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth()
  if (!member) return respond.error('auth error')
  if (!event.body) return respond.error('no body')
  const { query }: ChatRequest = JSON.parse(event.body)
  const { memberId, userId, workspaceId } = member
  const rateExceeded = await isRateLimitExceeded(memberId)
  console.log('rateExceeded', rateExceeded)
  if (rateExceeded) {
    return respond.error('rate limit exceeded')
  }
  // const workspaceId = session.properties.userId;
  const rankedEmbeddings = await getRankedEmbeddings({
    userId,
    query,
    workspaceId,
    embeddingQuantity: 10
  })
  console.log(
    rankedEmbeddings.map((em) => `${em.originLink.text} ${em.weight}`)
  )
  const prompt = createPrompt({
    query,
    rankedEmbeddings
  })
  console.log(prompt)
  const completion = await createCompletion({
    prompt,
    user: userId
  })
  // remove source from completion
  if (!completion) {
    return respond.ok({
      completion: undefined,
      rankedEmbeddings: []
    })
  }
  const results = completion.split('SOURCES:')
  console.log(results)
  const answer = results[0]
  const sources = results[1].split('-pl')
  console.log(sources)
  const sourceIndexes = sources.map((source) =>
    parseInt(source.replace(' ', '').replace(',', ''))
  )
  console.log(sourceIndexes)
  const filteredRankedEmbeddings = rankedEmbeddings.filter((_, index) =>
    sourceIndexes.includes(index)
  )
  const finalAnswer = filterWrongAnswers(answer)
  const answerFound = Boolean(finalAnswer !== "I don't know")
  console.log(filteredRankedEmbeddings)
  const response: ChatResponse = {
    completion: answer,
    rankedEmbeddings: answerFound
      ? filteredRankedEmbeddings.map(mapRankedEmbeddings)
      : []
  }
  await ChatHistory.create({
    memberId: member.memberId,
    workspaceId,
    query,
    response: answer,
    answerFound
  })
  return respond.ok(response)
})

/* sometimes the answer leaks from the promt because the question does not make sense **/
const filterWrongAnswers = (answer: string) => {
  if (!answer) return "I don't know"
  if (answer === 'The president did not mention Michael Jackson.') {
    return "I don't know"
  }
  return answer
}

/*
Check rate limit openai API, this is required to get aproval from Openai
and is a good thing to include anyway as they costs can go up pretty fast
We check in chat history the last requests made in the last minute
*/
const isRateLimitExceeded = async (memberId: string) => {
  const rateLimit = 10
  const dateAMinuteAgo = new Date()
  dateAMinuteAgo.setMinutes(dateAMinuteAgo.getMinutes() - 1)
  const lastRequest = await ChatHistory.listByUser({
    memberId,
    fromDate: dateAMinuteAgo
  })
  console.log(lastRequest)
  if (!lastRequest) return false
  return lastRequest.length > rateLimit
}

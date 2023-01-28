/*

This file contains the OpenAI API calls for the project.
It tries to implement the best practices for using the API out of the box as much as possible.
https://beta.openai.com/docs/guides/safety-best-practices

**/

import dedent from 'dedent'
import { Configuration, OpenAIApi } from 'openai'
import { Config } from 'sst/node/config'
import { EmbeddingEntityType, Embedding, mapRankedEmbeddings } from './embedding'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { queryEmbeddings } from './pinecone'
import { ChatHistory } from './chat-history'
// TODO weird bug here where the import is not working
// eslint-disable-next-line new-cap
const tokenizer = new (GPT3Tokenizer as any).default({ type: 'gpt3' })

const configuration = new Configuration({
  apiKey: Config.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)
const EMBEDDING_MODEL = 'text-embedding-ada-002'
const COMPLETION_MODEL = 'text-davinci-003'
const COMPLETION_TOKENS = 256
const COMPLETION_MAX_TOKENS = 4096
const createEmbedding = async ({
  user,
  text
}: {
  user: string
  text: string
}) => {
  return await openai
    .createEmbedding({
      user,
      model: EMBEDDING_MODEL,
      input: text.split('\n').join(' ')
    })
    .then((embedding) => {
      return embedding.data.data[0].embedding
    })
}

export const createEmbeddingWithRetry = async ({
  user,
  text
}: {
  user: string
  text: string
}) => {
  return await linearBackoffCall({
    call: async () => await createEmbedding({ user, text }),
    maxRetries: 3,
    retryDelay: 1000
  })
}

const linearBackoffCall = async <T>({
  call,
  maxRetries,
  retryDelay
}: {
  call: () => Promise<T>
  maxRetries: number
  retryDelay: number
}) => {
  let retries = 0
  while (retries < maxRetries) {
    try {
      return await call()
    } catch (error: any) {
      // only retry if error is throttling
      if (error.status === 429 || error.response.status === 429) {
        console.log('error', error)
        retries++
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * retries)
        )
      }
    }
  }
  throw new Error('Max retries reached')
}

export type WeightedEmbedding = Pick<
EmbeddingEntityType,
'text' | 'originLink'
> & {
  weight: number
}

export const getRankedEmbeddings = async ({
  userId,
  query,
  workspaceId,
  embeddingQuantity
}: {
  userId: string
  query: string
  workspaceId: string
  embeddingQuantity: number
}): Promise<WeightedEmbedding[]> => {
  console.log('DO we get here?')
  // get the embedding for the query
  const queryEmbedding = await openai.createEmbedding({
    user: userId,
    model: EMBEDDING_MODEL,
    input: query.split('\n').join(' ')
  })
  const ada002 = queryEmbedding.data.data[0].embedding
  const embeddingMatches = await queryEmbeddings(
    workspaceId,
    ada002,
    embeddingQuantity
  )
  console.log('embeddingMatches', embeddingMatches)
  const embeddings = await Embedding.batchGetEmbeddings(
    workspaceId,
    embeddingMatches.map((match) => match.id)
  )
  const sortedEmbeddings = embeddings.map((embedding) => {
    const embeddingMatch = embeddingMatches.find(
      (match) => match.id === embedding.embeddingId
    )
    return {
      ...embedding,
      weight: embeddingMatch?.score as number
    }
  })
  return sortedEmbeddings.slice(0, embeddingQuantity).map((embedding) => {
    return {
      weight: embedding.weight,
      text: embedding.text,
      originLink: embedding.originLink
    }
  })
}

const createCompletion = async ({
  prompt,
  user
}: {
  prompt: string
  user: string
}) => {
  const isCompliant = await checkModerationCompliance(prompt)
  if (!isCompliant) {
    throw new Error("Prompt is not compliant with OpenAI's moderation policy")
  }
  const temperature = 0
  // Create Params for the API
  const params = {
    model: COMPLETION_MODEL,
    prompt,
    stream: false,
    temperature,
    user,
    max_tokens: COMPLETION_TOKENS
  }

  // Get completed response data from OpenAPI
  const completion = await openai.createCompletion(params)
  return completion.data.choices[0].text
}

const createCompletionWithRetry = async ({
  prompt,
  user
}: {
  prompt: string
  user: string
}) => {
  return await linearBackoffCall({
    call: async () => await createCompletion({ prompt, user }),
    maxRetries: 3,
    retryDelay: 1000
  })
}

const createPrompt = ({
  rankedEmbeddings,
  query,
  language
}: {
  rankedEmbeddings: WeightedEmbedding[]
  query: string
  language: 'en' | 'fr'

}) => {
  const MAX_TOKEN_SIZE = COMPLETION_MAX_TOKENS - COMPLETION_TOKENS - 100 // we keep a margin of 100 tokens in case our calculation is not exactly right
  // compute the prompt length without the context so we can add only the context that fits
  let context = ''
  let promptLength = getPromptLength(getPrompt({ language }).template({ query, context }))
  for (let i = 0; i < rankedEmbeddings.length; i++) {
    const rankedEmbedding = rankedEmbeddings[i]
    const fullText = getPromtContext(rankedEmbedding, i, language)
    const length = getPromptLength(fullText)
    if (promptLength + length > MAX_TOKEN_SIZE) {
      break
    }
    promptLength += length
    context += fullText + '\n'
  }
  const prompt = getPrompt({ language }).template({ query, context })
  return prompt
}

export const getPromptLength = (prompt: string): number => {
  return tokenizer.encode(prompt).bpe.length
}

const getPromtContext = (
  rankedEmbeddings: WeightedEmbedding,
  index: number,
  language: 'en' | 'fr'
) => {
  return dedent`${getPrompt({ language }).contentText}: ${rankedEmbeddings.text.context}
    ${rankedEmbeddings.text.content}
    ${getPrompt({ language }).sourceText}: ${index}-pl`
}

/**
 * Check the prompt for moderation compliance, maybe this function should only be activated with some config flag
 */
const checkModerationCompliance = async (prompt: string) => {
  const res = await openai.createModeration({
    input: prompt,
    model: 'text-moderation-stable'
  })
  const flagged = res.data.results[0].flagged
  return !flagged
}

export const getChatAnswer = async ({
  userId,
  query,
  workspaceId,
  memberId,
  language
}: { userId: string
  query: string
  memberId: string
  workspaceId: string
  language: 'en' | 'fr' }) => {
  const rateExceeded = await ChatHistory.isRateLimitExceeded(memberId)
  console.log('rateExceeded', rateExceeded)
  if (rateExceeded) {
    throw new Error('rate limit exceeded')
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
    rankedEmbeddings,
    language
  })
  console.log(prompt)
  const completion = await createCompletionWithRetry({
    prompt,
    user: userId
  })
  // remove source from completion
  if (!completion) {
    return {
      completion: undefined,
      rankedEmbeddings: []
    }
  }
  const results = completion.split(getPrompt({ language }).sourcesText + ':')
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
  const response = {
    completion: answer,
    rankedEmbeddings: answerFound
      ? filteredRankedEmbeddings.map(mapRankedEmbeddings)
      : []
  }
  await ChatHistory.create({
    memberId,
    workspaceId,
    query,
    response: answer,
    answerFound
  })
  return response
}

/* sometimes the answer leaks from the promt because the question does not make sense **/
const filterWrongAnswers = (answer: string) => {
  if (!answer) return "I don't know"
  if (answer === 'The president did not mention Michael Jackson.') {
    return "I don't know"
  }
  return answer
}

const getPrompt = ({ language }: { language: 'en' | 'fr' }) => {
  const prompts = {
    en: {
      template: ({ query, context }: { query: string, context: string }) => dedent`Given the following extracted parts of a long document and a question, create a final answer with references ("SOURCES"). 
      If you don't know the answer, just say that you don't know. Don't try to make up an answer.
      ALWAYS return a "SOURCES" part in your answer.
      QUESTION: Which state/country's law governs the interpretation of the contract?
      =========
      Content: This Agreement is governed by English law and the parties submit to the exclusive jurisdiction of the English courts in  relation to any dispute (contractual or non-contractual) concerning this Agreement save that either party may apply to any court for an  injunction or other relief to protect its Intellectual Property Rights.
      Source: 28-pl
      Content: (b) if Google believes, in good faith, that the Distributor has violated or caused Google to violate any Anti-Bribery Laws (as  defined in Clause 8.5) or that such a violation is reasonably likely to occur,
      Source: 4-pl
      =========
      FINAL ANSWER: This Agreement is governed by English law.
      SOURCES: 28-pl
      QUESTION: What did the president say about Michael Jackson?
      =========
      Content: And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.  \n\nTo all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. \n\nAnd I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 
      Source: 5-pl
      Content: More support for patients and families. \n\nTo get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. \n\nIt’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.  \n\nARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more. \n\nA unity agenda for the nation. \n\nWe can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy.
      Source: 34-pl
      =========
      FINAL ANSWER: The president did not mention Michael Jackson.
      SOURCES:
      QUESTION: ${query}
      =========
      ${context}
      =========
      FINAL ANSWER:`,
      finalAnswerText: 'FINAL ANSWER',
      contentText: 'Content',
      sourceText: 'Source',
      sourcesText: 'SOURCES',
      questionText: 'QUESTION'
    },
    fr: {
      template: ({ query, context }: { query: string, context: string }) => dedent`Étant donné les parties extraites suivantes d'un long document et d'une question, créez une réponse finale avec des références ("SOURCES").
      Si vous ne connaissez pas la réponse, dites simplement que vous ne savez pas. N'essayez pas d'inventer une réponse.
      Retournez TOUJOURS une partie "SOURCES" dans votre réponse.
      QUESTION: Quelle loi de l'État/du pays régit l'interprétation du contrat ?
      =========
      Contenu: Le présent Contrat est régi par le droit anglais et les parties se soumettent à la compétence exclusive des tribunaux anglais en ce qui concerne tout litige (contractuel ou non contractuel) concernant le présent Contrat, sauf que l'une ou l'autre des parties peut demander à tout tribunal une injonction ou autre secours pour protéger ses droits de propriété intellectuelle.
      Source: 28-pl
      Contenu: aucune renonciation. L'échec ou le retard dans l'exercice de tout droit ou recours en vertu du présent Accord ne constitue pas une renonciation à ce droit ou recours (ou à tout autre).\n\n11.7 Divisibilité. L'invalidité, l'illégalité ou l'inapplicabilité de tout terme (ou partie d'un terme) du présent Accord n'affectera pas le maintien en vigueur du reste du terme (le cas échéant) et du présent Accord.\n\n11.8 Aucune agence. Sauf indication contraire expresse, rien dans le présent Accord ne crée une agence, un partenariat ou une coentreprise de quelque nature que ce soit entre les parties.\n\n11.9 Aucun bénéficiaire tiers.
      Source: 30-pl
      Contenu: (b) si Google estime, de bonne foi, que le Distributeur a enfreint ou a incité Google à enfreindre les Lois anti-corruption (telles que définies à la Clause 8.5) ou qu'une telle violation est raisonnablement susceptible de se produire,
      Source: 4-pl
      =========
      REPONSE FINALE: Le présent Contrat est régi par le droit anglais.
      SOURCES: 28-pl
      QUESTION: Qu'a dit le président à propos de Michael Jackson ?
      =========
      Contenu: Madame la Présidente, Madame la Vice-Présidente, notre Première Dame et notre Second Monsieur. Membres du Congrès et du Cabinet. Juges de la Cour suprême. Mes compatriotes américains. \n\nL'année dernière, le COVID-19 nous a séparés. Cette année, nous sommes enfin de nouveau ensemble. \n\nCe soir, nous nous réunissons en tant que Républicains Démocrates et Indépendants. Mais surtout en tant qu'Américains. \n\nAvec un devoir les uns envers les autres envers le peuple américain envers la Constitution. \n\nEt avec une détermination inébranlable que la liberté triomphera toujours de la tyrannie. \n\nIl y a six jours, le Russe Vladimir Poutine a cherché à ébranler les fondations du monde libre en pensant pouvoir le faire plier à ses voies menaçantes. Mais il a mal calculé. \n\nIl pensait qu'il pouvait rouler en Ukraine et que le monde basculerait. Au lieu de cela, il a rencontré un mur de force qu'il n'aurait jamais imaginé. \n\nIl a rencontré le peuple ukrainien. \n\nDu président Zelenskyy à chaque Ukrainien, leur intrépidité, leur courage, leur détermination inspirent le monde. \n\nGroupes de citoyens bloquant les chars avec leurs corps. Tout le monde, des étudiants aux enseignants retraités, est devenu un soldat défendant sa patrie.
      Source: 0-pl
      Contenu: Et nous n'arrêterons pas. \n\nNous avons tant perdu à cause du COVID-19. Du temps les uns avec les autres. Et le pire de tout, tant de vies perdues. \n\nProfitons de ce moment pour réinitialiser. Arrêtons de considérer le COVID-19 comme une ligne de démarcation partisane et voyons-le pour ce qu'il est : une maladie horrible. \n\nArrêtons de nous voir comme des ennemis et commençons à nous voir pour ce que nous sommes vraiment : des compatriotes américains. \n\nNous ne pouvons pas changer à quel point nous avons été divisés. Mais nous pouvons changer la façon dont nous avançons - sur le COVID-19 et d'autres problèmes auxquels nous devons faire face ensemble. \n\nJ'ai récemment visité le département de police de New York quelques jours après les funérailles de l'officier Wilbert Mora et de son partenaire, l'officier Jason Rivera. \n\nIls répondaient à un appel au 9-1-1 lorsqu'un homme leur a tiré dessus et les a tués avec une arme volée. \n\nL'officier Mora avait 27 ans. \n\nL'officier Rivera avait 22 ans. \n\nLes deux dominicains américains qui avaient grandi dans les mêmes rues qu'ils ont ensuite choisi de patrouiller en tant que policiers. \n\nJ'ai parlé avec leurs familles et leur ai dit que nous leur sommes éternellement redevables de leur sacrifice, et que nous poursuivrons leur mission de restaurer la confiance et la sécurité que chaque communauté mérite.
      Source: 24-pl
      Contenu: Et un peuple ukrainien fier, qui a connu 30 ans d'indépendance, a montré à plusieurs reprises qu'il ne tolérera personne qui essaie de faire reculer son pays. \n\nÀ tous les Américains, je serai honnête avec vous, comme je l'ai toujours promis. Un dictateur russe, envahissant un pays étranger, a des coûts dans le monde entier. \n\nEt je prends des mesures énergiques pour m'assurer que la douleur de nos sanctions soit ciblée sur l'économie russe. Et j'utiliserai tous les outils à notre disposition pour protéger les entreprises et les consommateurs américains. \n\nCe soir, je peux annoncer que les États-Unis ont travaillé avec 30 autres pays pour libérer 60 millions de barils de pétrole à partir des réserves du monde entier. \n\nL'Amérique dirigera cet effort, libérant 30 millions de barils de notre propre réserve stratégique de pétrole. Et nous sommes prêts à faire plus si nécessaire, unis avec nos alliés. \n\nCes mesures contribueront à faire chuter les prix de l'essence ici, chez nous. Et je sais que les nouvelles sur ce qui se passe peuvent sembler alarmantes. \n\nMais je veux que tu saches que tout ira bien.
      Source: 5-pl
      Contenu: Plus de soutien pour les patients et les familles. \n\nPour y arriver, j'appelle le Congrès à financer l'ARPA-H, l'Agence des projets de recherche avancée pour la santé. \n\nIl est basé sur le DARPA, le projet du ministère de la Défense qui a conduit à Internet, au GPS et bien plus encore. \n\nARPA-H aura un objectif unique: faire avancer les choses dans les domaines du cancer, de la maladie d'Alzheimer, du diabète, etc. \n\nUn programme d'unité pour la nation. \n\nNous pouvons le faire. \n\nMes compatriotes américains—ce soir, nous nous sommes réunis dans un espace sacré—la citadelle de notre démocratie. \n\nDans ce Capitole, génération après génération, les Américains ont débattu de grandes questions au milieu de grands conflits et ont fait de grandes choses. \n\nNous avons lutté pour la liberté, élargi la liberté, vaincu le totalitarisme et la terreur. \n\nEt construit la nation la plus forte, la plus libre et la plus prospère que le monde ait jamais connue. \n\nC'est l'heure. \n\nNotre moment de responsabilité. \n\nNotre test de résolution et de conscience, de l'histoire elle-même. \n\nC'est à ce moment que notre personnage se forme. Notre but est trouvé. Notre avenir est forgé. \n\nEh bien, je connais cette nation.
      Source: 34-pl
      =========
      REPONSE FINALE: Le président n'a pas mentionné Michael Jackson.
      SOURCES:
      QUESTION: ${query}
      =========
      ${context}
      =========
      REPONSE FINALE:
      `,
      finalAnswerText: 'REPONSE FINALE',
      contentText: 'Contenu',
      sourceText: 'Source',
      sourcesText: 'SOURCES',
      questionText: 'QUESTION'
    }
  }
  return prompts[language ?? 'en']
}

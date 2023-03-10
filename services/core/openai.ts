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
      Content: And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.  \n\nTo all Americans, I will be honest with you, as I???ve always promised. A Russian dictator, invading a foreign country, has costs around the world. \n\nAnd I???m taking robust action to make sure the pain of our sanctions  is targeted at Russia???s economy. And I will use every tool at our disposal to protect American businesses and consumers. 
      Source: 5-pl
      Content: More support for patients and families. \n\nTo get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. \n\nIt???s based on DARPA???the Defense Department project that led to the Internet, GPS, and so much more.  \n\nARPA-H will have a singular purpose???to drive breakthroughs in cancer, Alzheimer???s, diabetes, and more. \n\nA unity agenda for the nation. \n\nWe can do this. \n\nMy fellow Americans???tonight , we have gathered in a sacred space???the citadel of our democracy.
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
      template: ({ query, context }: { query: string, context: string }) => dedent`??tant donn?? les parties extraites suivantes d'un long document et d'une question, cr??ez une r??ponse finale avec des r??f??rences ("SOURCES").
      Si vous ne connaissez pas la r??ponse, dites simplement que vous ne savez pas. N'essayez pas d'inventer une r??ponse.
      Retournez TOUJOURS une partie "SOURCES" dans votre r??ponse.
      QUESTION: Quelle loi de l'??tat/du pays r??git l'interpr??tation du contrat ?
      =========
      Contenu: Le pr??sent Contrat est r??gi par le droit anglais et les parties se soumettent ?? la comp??tence exclusive des tribunaux anglais en ce qui concerne tout litige (contractuel ou non contractuel) concernant le pr??sent Contrat, sauf que l'une ou l'autre des parties peut demander ?? tout tribunal une injonction ou autre secours pour prot??ger ses droits de propri??t?? intellectuelle.
      Source: 28-pl
      Contenu: aucune renonciation. L'??chec ou le retard dans l'exercice de tout droit ou recours en vertu du pr??sent Accord ne constitue pas une renonciation ?? ce droit ou recours (ou ?? tout autre).\n\n11.7 Divisibilit??. L'invalidit??, l'ill??galit?? ou l'inapplicabilit?? de tout terme (ou partie d'un terme) du pr??sent Accord n'affectera pas le maintien en vigueur du reste du terme (le cas ??ch??ant) et du pr??sent Accord.\n\n11.8 Aucune agence. Sauf indication contraire expresse, rien dans le pr??sent Accord ne cr??e une agence, un partenariat ou une coentreprise de quelque nature que ce soit entre les parties.\n\n11.9 Aucun b??n??ficiaire tiers.
      Source: 30-pl
      Contenu: (b) si Google estime, de bonne foi, que le Distributeur a enfreint ou a incit?? Google ?? enfreindre les Lois anti-corruption (telles que d??finies ?? la Clause 8.5) ou qu'une telle violation est raisonnablement susceptible de se produire,
      Source: 4-pl
      =========
      REPONSE FINALE: Le pr??sent Contrat est r??gi par le droit anglais.
      SOURCES: 28-pl
      QUESTION: Qu'a dit le pr??sident ?? propos de Michael Jackson ?
      =========
      Contenu: Madame la Pr??sidente, Madame la Vice-Pr??sidente, notre Premi??re Dame et notre Second Monsieur. Membres du Congr??s et du Cabinet. Juges de la Cour supr??me. Mes compatriotes am??ricains. \n\nL'ann??e derni??re, le COVID-19 nous a s??par??s. Cette ann??e, nous sommes enfin de nouveau ensemble. \n\nCe soir, nous nous r??unissons en tant que R??publicains D??mocrates et Ind??pendants. Mais surtout en tant qu'Am??ricains. \n\nAvec un devoir les uns envers les autres envers le peuple am??ricain envers la Constitution. \n\nEt avec une d??termination in??branlable que la libert?? triomphera toujours de la tyrannie. \n\nIl y a six jours, le Russe Vladimir Poutine a cherch?? ?? ??branler les fondations du monde libre en pensant pouvoir le faire plier ?? ses voies mena??antes. Mais il a mal calcul??. \n\nIl pensait qu'il pouvait rouler en Ukraine et que le monde basculerait. Au lieu de cela, il a rencontr?? un mur de force qu'il n'aurait jamais imagin??. \n\nIl a rencontr?? le peuple ukrainien. \n\nDu pr??sident Zelenskyy ?? chaque Ukrainien, leur intr??pidit??, leur courage, leur d??termination inspirent le monde. \n\nGroupes de citoyens bloquant les chars avec leurs corps. Tout le monde, des ??tudiants aux enseignants retrait??s, est devenu un soldat d??fendant sa patrie.
      Source: 0-pl
      Contenu: Et nous n'arr??terons pas. \n\nNous avons tant perdu ?? cause du COVID-19. Du temps les uns avec les autres. Et le pire de tout, tant de vies perdues. \n\nProfitons de ce moment pour r??initialiser. Arr??tons de consid??rer le COVID-19 comme une ligne de d??marcation partisane et voyons-le pour ce qu'il est : une maladie horrible. \n\nArr??tons de nous voir comme des ennemis et commen??ons ?? nous voir pour ce que nous sommes vraiment : des compatriotes am??ricains. \n\nNous ne pouvons pas changer ?? quel point nous avons ??t?? divis??s. Mais nous pouvons changer la fa??on dont nous avan??ons - sur le COVID-19 et d'autres probl??mes auxquels nous devons faire face ensemble. \n\nJ'ai r??cemment visit?? le d??partement de police de New York quelques jours apr??s les fun??railles de l'officier Wilbert Mora et de son partenaire, l'officier Jason Rivera. \n\nIls r??pondaient ?? un appel au 9-1-1 lorsqu'un homme leur a tir?? dessus et les a tu??s avec une arme vol??e. \n\nL'officier Mora avait 27 ans. \n\nL'officier Rivera avait 22 ans. \n\nLes deux dominicains am??ricains qui avaient grandi dans les m??mes rues qu'ils ont ensuite choisi de patrouiller en tant que policiers. \n\nJ'ai parl?? avec leurs familles et leur ai dit que nous leur sommes ??ternellement redevables de leur sacrifice, et que nous poursuivrons leur mission de restaurer la confiance et la s??curit?? que chaque communaut?? m??rite.
      Source: 24-pl
      Contenu: Et un peuple ukrainien fier, qui a connu 30 ans d'ind??pendance, a montr?? ?? plusieurs reprises qu'il ne tol??rera personne qui essaie de faire reculer son pays. \n\n?? tous les Am??ricains, je serai honn??te avec vous, comme je l'ai toujours promis. Un dictateur russe, envahissant un pays ??tranger, a des co??ts dans le monde entier. \n\nEt je prends des mesures ??nergiques pour m'assurer que la douleur de nos sanctions soit cibl??e sur l'??conomie russe. Et j'utiliserai tous les outils ?? notre disposition pour prot??ger les entreprises et les consommateurs am??ricains. \n\nCe soir, je peux annoncer que les ??tats-Unis ont travaill?? avec 30 autres pays pour lib??rer 60 millions de barils de p??trole ?? partir des r??serves du monde entier. \n\nL'Am??rique dirigera cet effort, lib??rant 30 millions de barils de notre propre r??serve strat??gique de p??trole. Et nous sommes pr??ts ?? faire plus si n??cessaire, unis avec nos alli??s. \n\nCes mesures contribueront ?? faire chuter les prix de l'essence ici, chez nous. Et je sais que les nouvelles sur ce qui se passe peuvent sembler alarmantes. \n\nMais je veux que tu saches que tout ira bien.
      Source: 5-pl
      Contenu: Plus de soutien pour les patients et les familles. \n\nPour y arriver, j'appelle le Congr??s ?? financer l'ARPA-H, l'Agence des projets de recherche avanc??e pour la sant??. \n\nIl est bas?? sur le DARPA, le projet du minist??re de la D??fense qui a conduit ?? Internet, au GPS et bien plus encore. \n\nARPA-H aura un objectif unique: faire avancer les choses dans les domaines du cancer, de la maladie d'Alzheimer, du diab??te, etc. \n\nUn programme d'unit?? pour la nation. \n\nNous pouvons le faire. \n\nMes compatriotes am??ricains???ce soir, nous nous sommes r??unis dans un espace sacr?????la citadelle de notre d??mocratie. \n\nDans ce Capitole, g??n??ration apr??s g??n??ration, les Am??ricains ont d??battu de grandes questions au milieu de grands conflits et ont fait de grandes choses. \n\nNous avons lutt?? pour la libert??, ??largi la libert??, vaincu le totalitarisme et la terreur. \n\nEt construit la nation la plus forte, la plus libre et la plus prosp??re que le monde ait jamais connue. \n\nC'est l'heure. \n\nNotre moment de responsabilit??. \n\nNotre test de r??solution et de conscience, de l'histoire elle-m??me. \n\nC'est ?? ce moment que notre personnage se forme. Notre but est trouv??. Notre avenir est forg??. \n\nEh bien, je connais cette nation.
      Source: 34-pl
      =========
      REPONSE FINALE: Le pr??sident n'a pas mentionn?? Michael Jackson.
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

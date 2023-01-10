/* 

This file contains the OpenAI API calls for the project.
It tries to implement the best practices for using the API out of the box as much as possible.
https://beta.openai.com/docs/guides/safety-best-practices

**/

import { Configuration, OpenAIApi } from "openai";
import { Config } from "@serverless-stack/node/config";
import { EmbeddingEntityType, Embedding } from "./embedding";
import GPT3Tokenizer from "gpt3-tokenizer";
import { queryEmbeddings } from "./pinecone";
//TODO weird bug here where the import is not working
const tokenizer = new (GPT3Tokenizer as any).default({ type: "gpt3" });

const configuration = new Configuration({
  apiKey: Config.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const EMBEDDING_MODEL = "text-embedding-ada-002";
const COMPLETION_MODEL = "text-davinci-003";
const COMPLETION_TOKENS = 256;
const COMPLETION_MAX_TOKENS = 4096;
export const createEmbedding = async ({
  user,
  text,
}: {
  user: string;
  text: string;
}) => {
  return openai
    .createEmbedding({
      user,
      model: EMBEDDING_MODEL,
      input: text.split("\n").join(" "),
    })
    .then((embedding) => {
      return embedding.data.data[0].embedding;
    });
};

export const createEmbeddingWithRetry = async ({
  user,
  text,
}: {
  user: string;
  text: string;
}) => {
  return linearBackoffCall({
    call: () => createEmbedding({ user, text }),
    maxRetries: 3,
    retryDelay: 1000,
  });
};

export const linearBackoffCall = async <T>({
  call,
  maxRetries,
  retryDelay,
}: {
  call: () => Promise<T>;
  maxRetries: number;
  retryDelay: number;
}) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await call();
    } catch (error: any) {
      // only retry if error is throttling
      if (error.status === 429 || error.response.status === 429) {
        console.log("error", error);
        retries++;
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * retries)
        );
      }
    }
  }
  throw new Error("Max retries reached");
};

export type WeightedEmbedding = Pick<
  EmbeddingEntityType,
  "text" | "originLink"
> & {
  weight: number;
};

export const getRankedEmbeddings = async ({
  userId,
  query,
  workspaceId,
  embeddingQuantity,
}: {
  userId: string;
  query: string;
  workspaceId: string;
  embeddingQuantity: number;
}): Promise<Array<WeightedEmbedding>> => {
  // get the embedding for the query
  const queryEmbedding = await openai.createEmbedding({
    user: userId,
    model: EMBEDDING_MODEL,
    input: query.split("\n").join(" "),
  });
  const ada002 = queryEmbedding.data.data[0].embedding;
  const embeddingMatches = await queryEmbeddings(
    workspaceId,
    ada002,
    embeddingQuantity
  );
  const embeddings = await Embedding.batchGetEmbeddings(
    workspaceId,
    embeddingMatches.map((match) => match.id)
  );
  const sortedEmbeddings = embeddings.map((embedding) => {
    const embeddingMatch = embeddingMatches.find(
      (match) => match.id === embedding.embeddingId
    );
    return {
      ...embedding,
      weight: embeddingMatch?.score as number,
    };
  });
  return sortedEmbeddings.slice(0, embeddingQuantity).map((embedding) => {
    return {
      weight: embedding.weight,
      text: embedding.text,
      originLink: embedding.originLink,
    };
  });
};

export const createCompletion = async ({
  prompt,
  user,
}: {
  prompt: string;
  user: string;
}) => {
  const isCompliant = await checkModerationCompliance(prompt);
  if (!isCompliant) {
    throw new Error("Prompt is not compliant with OpenAI's moderation policy");
  }
  const temperature = 0;
  // Create Params for the API
  const params = {
    model: COMPLETION_MODEL,
    prompt,
    stream: false,
    temperature,
    user,
    max_tokens: COMPLETION_TOKENS,
  };

  // Get completed response data from OpenAPI
  const completion = await openai.createCompletion(params);
  return completion.data.choices[0].text;
};

export const createCompletionWithRetry = async ({
  prompt,
  user,
}: {
  prompt: string;
  user: string;
}) => {
  return linearBackoffCall({
    call: () => createCompletion({ prompt, user }),
    maxRetries: 3,
    retryDelay: 1000,
  });
};

export const createPrompt = ({
  rankedEmbeddings,
  query,
}: {
  rankedEmbeddings: WeightedEmbedding[];
  query: string;
}) => {
  const MAX_TOKEN_SIZE = COMPLETION_MAX_TOKENS - COMPLETION_TOKENS - 100; // we keep a margin of 100 tokens in case our calculation is not exactly right
  const promptHeader = `Given the following extracted parts of a long document and a question, create a final answer with references ("SOURCES"). 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.
ALWAYS return a "SOURCES" part in your answer.
QUESTION: Which state/country's law governs the interpretation of the contract?
=========
Content: This Agreement is governed by English law and the parties submit to the exclusive jurisdiction of the English courts in  relation to any dispute (contractual or non-contractual) concerning this Agreement save that either party may apply to any court for an  injunction or other relief to protect its Intellectual Property Rights.
Source: 28-pl
Content: No Waiver. Failure or delay in exercising any right or remedy under this Agreement shall not constitute a waiver of such (or any other)  right or remedy.\n\n11.7 Severability. The invalidity, illegality or unenforceability of any term (or part of a term) of this Agreement shall not affect the continuation  in force of the remainder of the term (if any) and this Agreement.\n\n11.8 No Agency. Except as expressly stated otherwise, nothing in this Agreement shall create an agency, partnership or joint venture of any  kind between the parties.\n\n11.9 No Third-Party Beneficiaries.
Source: 30-pl
Content: (b) if Google believes, in good faith, that the Distributor has violated or caused Google to violate any Anti-Bribery Laws (as  defined in Clause 8.5) or that such a violation is reasonably likely to occur,
Source: 4-pl
=========
FINAL ANSWER: This Agreement is governed by English law.
SOURCES: 28-pl
QUESTION: What did the president say about Michael Jackson?
=========
Content: Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. \n\nGroups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.
Source: 0-pl
Content: And we won’t stop. \n\nWe have lost so much to COVID-19. Time with one another. And worst of all, so much loss of life. \n\nLet’s use this moment to reset. Let’s stop looking at COVID-19 as a partisan dividing line and see it for what it is: A God-awful disease.  \n\nLet’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans.  \n\nWe can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. \n\nI recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. \n\nThey were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. \n\nOfficer Mora was 27 years old. \n\nOfficer Rivera was 22. \n\nBoth Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers. \n\nI spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.
Source: 24-pl
Content: And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.  \n\nTo all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. \n\nAnd I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. \n\nTonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.  \n\nAmerica will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  \n\nThese steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming. \n\nBut I want you to know that we are going to be okay.
Source: 5-pl
Content: More support for patients and families. \n\nTo get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. \n\nIt’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.  \n\nARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more. \n\nA unity agenda for the nation. \n\nWe can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. \n\nIn this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. \n\nWe have fought for freedom, expanded liberty, defeated totalitarianism and terror. \n\nAnd built the strongest, freest, and most prosperous nation the world has ever known. \n\nNow is the hour. \n\nOur moment of responsibility. \n\nOur test of resolve and conscience, of history itself. \n\nIt is in this moment that our character is formed. Our purpose is found. Our future is forged. \n\nWell I know this nation.
Source: 34-pl
=========
FINAL ANSWER: The president did not mention Michael Jackson.
SOURCES:
QUESTION: ${query}
=========
`;
  const promptFooter = `=========
FINAL ANSWER:`;
  let promptLength = getPromptLength(promptHeader + promptFooter);
  let context = "";
  for (let i = 0; i < rankedEmbeddings.length; i++) {
    const rankedEmbedding = rankedEmbeddings[i];
    const fullText = getPromtContext(rankedEmbedding, i);
    const length = getPromptLength(fullText);
    if (promptLength + length > MAX_TOKEN_SIZE) {
      break;
    }
    promptLength += length;
    context += fullText + "\n";
  }
  const prompt = `${promptHeader}\n${context}\n${promptFooter}`;
  return prompt;
};

export const getPromptLength = (prompt: string) => {
  return tokenizer.encode(prompt).bpe.length;
};

const getPromtContext = (
  rankedEmbeddings: WeightedEmbedding,
  index: number
) => {
  return `Content ${rankedEmbeddings.text.context}
  ${rankedEmbeddings.text.content}
  Source: ${index}-pl`;
};

/**
 * Check the prompt for moderation compliance, maybe this function should only be activated with some config flag
 */
export const checkModerationCompliance = async (prompt: string) => {
  const res = await openai.createModeration({
    input: prompt,
    model: "text-moderation-stable",
  });
  const flagged = res.data.results[0].flagged;
  return !flagged;
};

import { respond } from "@gpt-workspace-search/core/respond";
import {
  getRankedEmbeddings,
  createPrompt,
  createCompletion,
} from "@gpt-workspace-search/core/openai";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ChatRequest, ChatResponse } from "./types";
import { mapRankedEmbeddings } from "@gpt-workspace-search/core/embedding";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.body) return respond.error("No body provided");

  const { query }: ChatRequest = JSON.parse(event.body);
  const user = "admin";
  const worspaceId = "test";
  const rankedEmbeddings = await getRankedEmbeddings({
    userId: user,
    query,
    workspaceId: worspaceId,
    embeddingQuantity: 10,
  });
  console.log(
    rankedEmbeddings.map((em) => `${em.originLink.text} ${em.weight}`)
  );
  const prompt = createPrompt({
    query,
    rankedEmbeddings,
  });
  console.log(prompt);
  const completion = await createCompletion({
    prompt,
    user,
  });
  // remove source from completion
  if (!completion) {
    return respond.ok({
      completion: undefined,
      rankedEmbeddings: [],
    });
  }
  const results = completion.split("SOURCES:");
  console.log(results);
  const answer = results[0];
  const sources = results[1].split("-pl");
  console.log(sources);
  const sourceIndexes = sources.map((source) =>
    parseInt(source.replace(" ", "").replace(",", ""))
  );
  console.log(sourceIndexes);
  const filteredRankedEmbeddings = rankedEmbeddings.filter((_, index) =>
    sourceIndexes.includes(index)
  );
  console.log(filteredRankedEmbeddings);
  const response: ChatResponse = {
    completion: answer,
    rankedEmbeddings: filteredRankedEmbeddings.map(mapRankedEmbeddings),
  };
  return respond.ok(response);
};

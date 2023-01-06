import { respond } from "../utils";
import {
  getRankedEmbeddings,
  createPrompt,
  createCompletion,
} from "@gpt-workspace-search/core/openai";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ChatRequest, ChatResponse } from "./types";
import { mapRankedEmbeddings } from "@gpt-workspace-search/core/embedding";
import { ApiHandler } from "@serverless-stack/node/api";
import { useAuth } from "functions/utils";

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth(event);
  if (!member) return respond.error("auth error");
  if (!event.body) return respond.error("no body");
  const { query }: ChatRequest = JSON.parse(event.body);
  const { userId, workspaceId } = member;
  // const workspaceId = session.properties.userId;
  const rankedEmbeddings = await getRankedEmbeddings({
    userId,
    query,
    workspaceId,
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
    user: userId,
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
});

import {
  Embedding,
  mapRankedEmbeddings,
} from "@gpt-workspace-search/core/embedding";
import { respond } from "@gpt-workspace-search/core/respond";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { EmbeddingsResponse } from "./types";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const embeddings = await Embedding.list("test");
  const response: EmbeddingsResponse = embeddings.map((embedding) =>
    mapRankedEmbeddings({ ...embedding, weight: 0 })
  );
  return respond.ok(response);
};

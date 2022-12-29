import { Embedding } from "@gpt-workspace-search/core/embedding";
import {
  getAllDatabases,
  savePageEmbeddings,
} from "@gpt-workspace-search/core/notion";
import { respond } from "@gpt-workspace-search/core/respond";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const pages = await getAllDatabases();
  console.log(pages);
  const workspaceId = "test";
  for (const page of pages) {
    await deletePreviousEmbeddings(workspaceId, page.id);
    await savePageEmbeddings(page.id);
  }
  return respond.ok("ok");
};

const deletePreviousEmbeddings = async (
  workspaceId: string,
  originId: string
) => {
  const previousEmbeddings = await Embedding.listByOrigin(
    workspaceId,
    "NOTION",
    originId
  );
  const previousEmbeddingIds = previousEmbeddings.map(
    (previousEmbedding) => previousEmbedding.embeddingId
  );
  await Embedding.batchDeleteEmbedding(workspaceId, previousEmbeddingIds);
};

import { Embedding } from "@gpt-workspace-search/core/embedding";
import {
  getAllDatabases,
  savePageEmbeddings,
} from "@gpt-workspace-search/core/notion";
import { respond, useAuth } from "functions/utils";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { ApiHandler } from "@serverless-stack/node/api";
import { Connection } from "@gpt-workspace-search/core/connection";
export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth();
  if (!member) return respond.error("auth error");
  const connections = await Connection.list(member.workspaceId);
  const notionConnections = connections.filter(
    (connection) => connection.type === "NOTION" && connection.notionToken
  );
  const workspaceId = member.workspaceId;
  for (const notionConnection of notionConnections) {
    const notionToken = notionConnection.notionToken;
    const connectionId = notionConnection.connectionId;
    if (!notionToken) {
      return respond.error("no notion token");
    }
    const pages = await getAllDatabases(notionToken);
    console.log(pages);
    for (const page of pages) {
      await deletePreviousEmbeddings(workspaceId, page.id);
      await savePageEmbeddings({
        notionToken,
        workspaceId,
        pageId: page.id,
        connectionId,
      });
    }
  }
  return respond.ok("ok");
});

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

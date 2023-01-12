import { respond, useAuth } from "functions/utils";
import { ApiHandler } from "@serverless-stack/node/api";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { Connection } from "@gpt-librarian/core/connection";
import { CreateConnectionRequest, CreateConnectionResponse } from "./types";

export const handler: APIGatewayProxyHandlerV2 = ApiHandler(async (event) => {
  const member = await useAuth();
  if (!member) return respond.error("auth error");
  if (!event.body) return respond.error("no body");
  const { type, notionToken, name }: CreateConnectionRequest = JSON.parse(
    event.body
  );
  // const workspaceId = session.properties.userId;
  const connection = await Connection.create({
    type,
    notionToken,
    workspaceId: member.workspaceId,
    name,
  });
  const response: CreateConnectionResponse = connection;
  return respond.ok(response);
});

import { ulid } from "ulid";
import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./dynamo";

export const ChatHistoryEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "ChatHistory",
      service: "history",
    },
    attributes: {
      chatHistoryId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      query: {
        type: "string",
        required: true,
        readOnly: true,
      },
      response: {
        type: "string",
        required: true,
        readOnly: true,
      },
      answerFound: {
        type: "boolean",
        required: true,
        readOnly: true,
      },
      userSatisfaction: {
        type: ["OK", "NOT_OK"],
      },
      workspaceId: { type: "string", required: true, readOnly: true },
      memberId: { type: "string", required: true, readOnly: true },
      createdAt: { type: "string", required: true, readOnly: true },
      updatedAt: { type: "string", required: true, readOnly: false },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["workspaceId"],
        },
        sk: {
          field: "sk",
          composite: ["chatHistoryId"],
        },
      },
      byMember: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["memberId"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["createdAt"],
        },
      },
      byOrganization: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["workspaceId"],
          sk: {
            field: "gsi2sk",
            composite: ["createdAt"],
          },
        },
      },
    },
  },
  Dynamo.Configuration
);

export type ChatHistoryEntityType = EntityItem<typeof ChatHistoryEntity>;

export const list = async (workspaceId: string) => {
  const result = await ChatHistoryEntity.query.primary({ workspaceId }).go();
  return result.data;
};

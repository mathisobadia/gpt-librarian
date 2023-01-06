import { ulid } from "ulid";
import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./dynamo";
export * as Member from "./member";

export const MemberEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Member",
      service: "organization",
    },
    attributes: {
      workspaceId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      memberId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      role: {
        type: ["ADMIN", "MEMBER"],
      },
      userId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      invitedEmail: {
        type: "string",
      },
      invitedName: {
        type: "string",
      },
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
          composite: ["memberId"],
        },
      },
      byUser: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["userId"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["createdAt"],
        },
      },
    },
  },
  Dynamo.Configuration
);

export type MemberEntityType = EntityItem<typeof MemberEntity>;

export const create = async ({
  workspaceId,
  userId,
  invitedEmail,
  invitedName,
  role,
}: {
  workspaceId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  invitedEmail?: string;
  invitedName?: string;
}) => {
  const memberId = ulid();
  const member = await MemberEntity.put({
    workspaceId,
    memberId,
    userId,
    invitedEmail,
    invitedName,
    role: role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).go();
  return member.data;
};

export const list = async (workspaceId: string) => {
  const result = await MemberEntity.query
    .primary({
      workspaceId,
    })
    .go();
  return result.data;
};

export const listByUser = async (userId: string) => {
  const result = await MemberEntity.query
    .byUser({
      userId,
    })
    .go();
  return result.data;
};

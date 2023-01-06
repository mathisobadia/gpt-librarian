import { ulid } from "ulid";
import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./dynamo";
export * as Workspace from "./workspace";

export const WorkspaceEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Workspace",
      service: "organization",
    },
    attributes: {
      organizationId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      name: {
        type: "string",
      },
      workspaceId: {
        type: "string",
        required: true,
        readOnly: true,
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
          composite: [],
        },
      },
      byOrganization: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["organizationId"],
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

export type WorkspaceEntityType = EntityItem<typeof WorkspaceEntity>;

export const list = async (organizationId: string) => {
  const result = await WorkspaceEntity.query
    .byOrganization({
      organizationId,
    })
    .go();
  return result.data;
};

export const create = async (organizationId: string, name?: string) => {
  const workspaceId = ulid();
  const result = await WorkspaceEntity.create({
    organizationId,
    workspaceId,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).go();
  return result.data;
};

export const get = async (workspaceId: string) => {
  const result = await WorkspaceEntity.get({
    workspaceId,
  }).go();
  return result.data;
};

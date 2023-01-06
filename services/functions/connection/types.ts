export type CreateConnectionRequest = {
  type: "NOTION";
  notionToken: string;
  name?: string;
};

export type CreateConnectionResponse = {
  connectionId: string;
  workspaceId: string;
  type: "NOTION";
  name?: string;
};

export type ListConnectionsResponse = Array<CreateConnectionResponse>;

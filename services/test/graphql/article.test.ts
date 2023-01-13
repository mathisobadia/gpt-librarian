// import { Api } from "@serverless-stack/node/api";
import { expect, it } from "vitest";
import { Embedding } from "@gpt-librarian/core/embedding";

const workspaceId = "test";
it("create an article", async () => {
  // TODO: create from the api
  const embedding = await Embedding.batchCreateEmbedding([
    {
      ada002: [1, 2, 3],
      text: {
        content: "test",
        context: "test",
      },
      connectionId: "test",
      originId: "test",
      workspaceId,
      originLink: {
        text: "test",
        url: "https://test",
      },
    },
  ]);
  const list = await Embedding.list(workspaceId);
  expect(list.length).toBe(1);
});

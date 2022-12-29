// import { Api } from "@serverless-stack/node/api";
import { expect, it } from "vitest";
import { Embedding } from "@gpt-workspace-search/core/embedding";

const workspaceId = "test";
it("create an article", async () => {
  // TODO: create from the api
  const embedding = await Embedding.create({
    ada002: [1, 2, 3],
    text: "test",
    originData: {},
    originId: "test",
    workspaceId,
    originLink: "https://test.com/link/",
  });
  const list = await Embedding.list(workspaceId);
  expect(
    list.find((a) => a.embeddingId === embedding.embeddingId)
  ).not.toBeNull();
});

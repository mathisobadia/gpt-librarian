import { Component, Match, Switch } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { listEmbeddings } from "../queries/list-embeddings";
import { EmbeddingList } from "../components/embedding";
import { useParams } from "@solidjs/router";

export const Embeddings: Component = () => {
  const param = useParams();
  const workspaceId = param.workspaceId;
  const listWorkspaceEmbeddings = () => listEmbeddings(workspaceId);
  const query = createQuery(() => ["embeddings"], listWorkspaceEmbeddings);
  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <Switch>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data}>
          <EmbeddingList embeddings={query.data!}></EmbeddingList>
        </Match>
      </Switch>
    </div>
  );
};

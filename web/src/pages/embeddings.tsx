import { Component, Match, Switch } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { getEmbeddings } from "../queries/getEmbeddings";
import { EmbeddingList } from "../components/embedding";

export const Embeddings: Component = () => {
  const query = createQuery(() => ["embeddings"], getEmbeddings);
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

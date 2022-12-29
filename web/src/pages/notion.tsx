import { createMutation } from "@tanstack/solid-query";
import { Component, Match, Switch } from "solid-js";
import { postNotion } from "../queries/postNotion";

export const Notion: Component = () => {
  const mutation = createMutation(["chatMessage"], postNotion);
  const onSubmit = (e: Event) => {
    e.preventDefault();
    mutation.mutate();
  };
  return (
    <div class="flex flex-col h-screen">
      <h1 class="text-2xl font-bold text-gray-600 dark:text-gray-300">
        Notion page
      </h1>
      <form class="mt-4" onSubmit={onSubmit}>
        <button
          disabled={mutation.isLoading}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Sync Embeddings
        </button>
      </form>
      <Switch>
        <Match when={mutation.isError}>
          <p>Error: {JSON.stringify(mutation.error)}</p>
        </Match>
        <Match when={mutation.isSuccess}>
          <p>Success!</p>
        </Match>
        <Match when={mutation.isLoading}>
          <p>Loading...</p>
        </Match>
      </Switch>
    </div>
  );
};

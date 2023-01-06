import type { Component } from "solid-js";
import { createMutation } from "@tanstack/solid-query";
import { Switch, Match, createSignal } from "solid-js";
import { queryChat } from "../queries/query-chat";
import { ChatMessage } from "../components/message";
import { EmbeddingList } from "../components/embedding";
import { useParams } from "@solidjs/router";

export const Chat: Component = () => {
  const [newChatQuery, setChatQuery] = createSignal("");
  const param = useParams();
  const workspaceId = param.workspaceId;
  const mutation = createMutation(["chatMessage"], queryChat);
  const onSubmit = (e: Event) => {
    e.preventDefault();
    mutation.mutate({ query: newChatQuery(), workspaceId });
  };
  const submitOnEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      mutation.mutate({ query: newChatQuery(), workspaceId });
    }
  };

  return (
    <div>
      <div class="left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient">
        <form
          onSubmit={onSubmit}
          class="stretch mx-2 flex flex-row gap-3 pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6"
        >
          <div class="relative flex h-full flex-1 md:flex-col">
            <div class="flex flex-col w-full py-2 pl-3 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
              <textarea
                class="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent"
                placeholder="enter query"
                required
                value={newChatQuery()}
                onKeyPress={submitOnEnter}
                onInput={(e) => setChatQuery(e.currentTarget.value)}
              />
              <button
                class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
                type="submit"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 20 20"
                  class="h-4 w-4 rotate-90"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-col items-center text-sm h-full dark:bg-gray-800">
        <Switch>
          <Match when={mutation.isIdle}>
            <p>test sending a query like "What is our backend stack?"</p>
          </Match>
          <Match when={mutation.isLoading}>
            <p>Loading...</p>
          </Match>
          <Match when={mutation.isError}>
            <p>Error: {JSON.stringify(mutation.error)}</p>
          </Match>
          <Match when={mutation.isSuccess && mutation.data}>
            <ChatMessage
              message={mutation.data?.completion!}
              type="bot"
            ></ChatMessage>
            <EmbeddingList
              embeddings={mutation.data?.rankedEmbeddings!}
            ></EmbeddingList>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

import type { Component } from "solid-js";
import { createMutation } from "@tanstack/solid-query";
import { Switch, Match, createSignal } from "solid-js";
import { queryChat } from "../queries/query-chat";
import { ChatMessage } from "../components/message";
import { EmbeddingList } from "../components/embedding";
import { useParams } from "@solidjs/router";
import { Button } from "../base-ui/button";

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
    if (e.key === "Enter" && !e.shiftKey) {
      mutation.mutate({ query: newChatQuery(), workspaceId });
    }
  };

  // resize textarea to fit content on key up
  const resizeTextArea = (e: Event) => {
    const el = e.currentTarget as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div>
      <div class="flex flex-row gap-3">
        <form onSubmit={onSubmit} class="w-full p-3">
          <div class="flex py-2 pl-3 md:py-3 bg-slate-2 rounded-md focus:ring-2 focus:ring-cyan-7">
            <textarea
              class="m-0 flex-auto text-slate-12 resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 overflow-hidden"
              placeholder="enter query"
              required
              value={newChatQuery()}
              onKeyPress={submitOnEnter}
              onKeyUp={resizeTextArea}
              onInput={(e) => setChatQuery(e.currentTarget.value)}
            />
            <div class="flex-none">
              <Button type="submit">
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
              </Button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-col items-center text-sm h-full">
        <Switch>
          <Match when={mutation.isIdle}>
            <p class="text-slate-12">
              test sending a query like "What is our backend stack?"
            </p>
          </Match>
          <Match when={mutation.isLoading}>
            <p class="text-slate-12">Loading...</p>
          </Match>
          <Match when={mutation.isError}>
            <p class="text-slate-12">Error: {JSON.stringify(mutation.error)}</p>
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

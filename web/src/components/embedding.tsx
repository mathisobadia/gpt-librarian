import {
  EmbeddingResponse,
  EmbeddingsResponse,
} from "@gpt-workspace-search/services/functions/embeddings/types";
import { Component, For } from "solid-js";
import { NotionLogo } from "./notion-logo";

export const EmbeddingItem: Component<EmbeddingResponse> = (props) => {
  const { textContent, originLink } = props;

  return (
    <li class="pb-3 sm:pb-4">
      <div class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <NotionLogo></NotionLogo>
        </div>
        <div class="flex-1 min-w-0">
          <a
            class="text-sm font-medium text-gray-900 truncate dark:text-white"
            href={originLink.url}
          >
            {originLink.text}
          </a>
          <p class="text-sm text-gray-500 text-clip dark:text-gray-400">
            {textContent}
          </p>
        </div>
        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
          go
        </div>
      </div>
    </li>
  );
};

export const EmbeddingList: Component<{ embeddings: EmbeddingsResponse }> = (
  props
) => {
  const { embeddings } = props;

  return (
    <ul class="max-w-2xl divide-y divide-gray-200 dark:divide-gray-700">
      <For each={embeddings}>
        {(embedding) => <EmbeddingItem {...embedding}></EmbeddingItem>}
      </For>
    </ul>
  );
};

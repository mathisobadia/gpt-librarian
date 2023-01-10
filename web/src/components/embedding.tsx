import {
  EmbeddingResponse,
  EmbeddingsResponse,
} from "@gpt-workspace-search/services/functions/embeddings/types";
import { Component, For } from "solid-js";
import { LinkSvg } from "../base-ui/link-svg";
import { NotionLogo } from "../base-ui/notion-logo";

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
            class="text-sm font-medium text-slate-12 truncate"
            href={originLink.url}
            target="_blank"
          >
            {originLink.text}
          </a>
          <p class="text-sm text-slate-11 text-clip">{textContent}</p>
        </div>
        <a
          class="inline-flex items-center text-base font-semibold text-slate-12 flex-shrink-0"
          href={originLink.url}
          target="_blank"
        >
          <LinkSvg />
        </a>
      </div>
    </li>
  );
};

export const EmbeddingList: Component<{ embeddings: EmbeddingsResponse }> = (
  props
) => {
  const { embeddings } = props;

  return (
    <ul class="max-w-2xl divide-y divide-slate-6">
      <For each={embeddings}>
        {(embedding) => <EmbeddingItem {...embedding}></EmbeddingItem>}
      </For>
    </ul>
  );
};

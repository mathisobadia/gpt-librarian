import {
  EmbeddingResponse,
  EmbeddingsResponse
} from '@gpt-librarian/services/functions/embeddings/types'
import { Icon } from 'solid-heroicons'
import { link } from 'solid-heroicons/outline'
import { Component, For } from 'solid-js'
import { NotionLogo } from '../base-ui/notion-logo'

export const EmbeddingItem: Component<EmbeddingResponse> = (props) => {
  return (
    <li class="pb-3 sm:pb-4">
      <div class="flex items-center space-x-4">
        <div class="shrink-0">
          <NotionLogo />
        </div>
        <div class="min-w-0 flex-1">
          <a
            class="text-slate-12 truncate text-sm font-medium"
            href={props.originLink.url}
            target="_blank"
          >
            {props.originLink.text}
          </a>
          <p class="text-slate-11 text-clip text-sm">{props.textContent}</p>
        </div>
        <a
          class="text-slate-12 inline-flex h-8 w-8 shrink-0 items-center text-base font-semibold"
          href={props.originLink.url}
          target="_blank"
        >
          <Icon path={link} />
        </a>
      </div>
    </li>
  )
}

export const EmbeddingList: Component<{ embeddings: EmbeddingsResponse }> = (
  props
) => {
  return (
    <ul class="divide-slate-6 max-w-2xl divide-y">
      <For each={props.embeddings}>
        {(embedding) => <EmbeddingItem {...embedding} />}
      </For>
    </ul>
  )
}

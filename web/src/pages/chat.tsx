import type { Component } from 'solid-js'
import { createMutation } from '@tanstack/solid-query'
import { Switch, Match, createSignal } from 'solid-js'
import { queryChat } from '../queries/query-chat'
import { ChatMessage } from '../components/message'
import { EmbeddingList } from '../components/embedding'
import { useParams } from '@solidjs/router'
import { Button } from '../base-ui/button'
import { Icon } from 'solid-heroicons'
import { paperAirplane } from 'solid-heroicons/outline'

export const Chat: Component = () => {
  const [newChatQuery, setChatQuery] = createSignal('')
  const param = useParams()
  const workspaceId = param.workspaceId
  const mutation = createMutation(['chatMessage'], queryChat)
  const onSubmit = (e: Event) => {
    e.preventDefault()
    mutation.mutate({ query: newChatQuery(), workspaceId })
  }
  const submitOnEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      mutation.mutate({ query: newChatQuery(), workspaceId })
    }
  }

  // resize textarea to fit content on key up
  const resizeTextArea = (e: Event) => {
    const el = e.currentTarget as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div>
      <div class="flex flex-row gap-3">
        <form onSubmit={onSubmit} class="w-full p-3">
          <div class="bg-slate-2 focus-visible:ring-cyan-7 flex rounded-md py-2 pl-3 focus:outline-none focus-visible:ring-2 md:py-3">
            <textarea
              class="text-slate-12 m-0 flex-auto resize-none overflow-hidden border-0 bg-transparent p-0 pr-7 focus:outline-none focus-visible:ring-0"
              placeholder="enter query"
              required
              value={newChatQuery()}
              onKeyPress={submitOnEnter}
              onKeyUp={resizeTextArea}
              onInput={(e) => setChatQuery(e.currentTarget.value)}
            />
            <div class="flex-none">
              <Button intent='ghost' type="submit">
                <Icon class='h-6 w-8' path={paperAirplane} />
              </Button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex h-full flex-col items-center text-sm">
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
             />
            <EmbeddingList
              embeddings={mutation.data?.rankedEmbeddings!}
             />
          </Match>

        </Switch>
      </div>
    </div>
  )
}

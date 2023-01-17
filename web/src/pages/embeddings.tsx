import { Component, Match, Switch } from 'solid-js'
import { createQuery } from '@tanstack/solid-query'
import { listEmbeddings } from '../queries/list-embeddings'
import { EmbeddingList } from '../components/embedding'
import { useParams } from '@solidjs/router'

export const Embeddings: Component = () => {
  const param = useParams()
  const workspaceId = param.workspaceId
  const listWorkspaceEmbeddings = async () => await listEmbeddings(workspaceId)
  const query = createQuery(() => ['embeddings'], listWorkspaceEmbeddings)
  return (
    <div class="bg-slate-2 flex flex-col items-center justify-center">
      <Switch>
        <Match when={query.isLoading}>
          <p class="text-slate-12">Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p class="text-slate-12">Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data}>
          <EmbeddingList embeddings={query.data!} />
        </Match>
      </Switch>
    </div>
  )
}

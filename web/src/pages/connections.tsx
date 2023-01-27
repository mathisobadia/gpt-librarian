import { useParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { Button } from '../base-ui/button'
import { Component, For, Match, Switch } from 'solid-js'
import { listConnections } from '../queries/list-connections'
import { NotionLogo } from '../base-ui/notion-logo'
import { Spinner } from '../base-ui/spinner'
import { CreateConnection } from '../components/create-connection'
import { syncConnectionsMutation } from '../queries/sync-connection'

export const Connections: Component = () => {
  const params = useParams()
  const workspaceId = params.workspaceId
  console.log('workspaceId::::', workspaceId)
  const listWorkspaceConnections = async () => await listConnections(workspaceId)

  const query = createQuery(() => ['connections', workspaceId], listWorkspaceConnections)

  return (
    <div class="flex h-screen flex-col">
      <h1 class="text-slate-11 text-2xl font-bold">Connections</h1>
      <h2 class="text-slate-12">Existing connections</h2>
      <Switch>
        <Match when={query.isLoading}>
          <Spinner/>
        </Match>
        <Match when={query.isError}>
          <p class="text-slate-12">Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data.length}>
          <ul>
            <For each={query.data}>
              {(connection) => (
                <Connection {...connection}/>
              )}
            </For>
          </ul>
        </Match>
        <Match when={query.isSuccess && query.data.length === 0}>
          <div>
            <h5 class="text-slate-12">No connections yet</h5>
            <p class="text-slate-11"> create your first connection by clicking the add connection button bellow</p>
          </div>
        </Match>
      </Switch>
      <div class="py-4">
        <h2 class="text-slate-12">Create new connection</h2>
        <CreateConnection/>
      </div>
    </div>
  )
}

const Connection: Component<{ connectionId: string, type: 'NOTION', name: string, createdAt: string, lastSyncedAt?: string, workspaceId: string }> = (props) => {
  const mutation = syncConnectionsMutation()
  const onSyncConnection = () => {
    console.log('syncing connection')
    mutation.mutate({
      connectionId: props.connectionId,
      workspaceId: props.workspaceId
    })
  }
  return (
    <div class="border-slate-7 bg-slate-3 shadow-slate-6 m-2 max-w-sm rounded-lg border p-3 shadow-md">
      <div class="divide-slate-6 flex flex-row gap-4 divide-x divide-solid">
        <div class="m-auto">
          <Switch>
            <Match when={props.type === 'NOTION'}>
              <NotionLogo class='inline h-10 w-10'/>
            </Match>
          </Switch>
        </div>
        <div class="">
          <h5 class="text-slate-12 mb-2 text-2xl font-bold tracking-tight">{props.name ?? 'Untitled'}</h5>
          <p class="text-slate-11">Created: {props.createdAt}, Last Synced: {props.lastSyncedAt ?? ''}</p>
        </div>
        <div class="m-auto">
          <Button intent='secondary' onClick={() => onSyncConnection()} disabled={mutation.isLoading} loading={mutation.isLoading}>
            Sync
          </Button>
        </div>
      </div>
    </div>
  )
}

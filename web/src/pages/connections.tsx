import { useParams } from '@solidjs/router'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { Button } from '../base-ui/button'
import { Component, createSignal, For, Match, Switch } from 'solid-js'
import { createConnection } from '../queries/create-connection'
import { fetchConnections } from '../queries/fetch-connections'
import { listConnections } from '../queries/list-connections'
import { Input } from '../base-ui/input'

export const Notion: Component = () => {
  const fetchConnectionMutation = createMutation(
    ['connections'],
    fetchConnections
  )
  const createConnectionMutation = createMutation(
    ['connections'],
    createConnection
  )
  const params = useParams()
  const workspaceId = params.workspaceId
  const listWorkspaceConnections = async () => await listConnections(workspaceId)
  const [connectionName, setConnectionName] = createSignal('')
  const [notionToken, setNotionToken] = createSignal('')
  const query = createQuery(() => ['connections'], listWorkspaceConnections)
  const onSubmitFetchConnections = (e: Event) => {
    e.preventDefault()
    fetchConnectionMutation.mutate(workspaceId)
  }
  const onSubmitCreateConnection = (e: Event) => {
    e.preventDefault()
    createConnectionMutation.mutate({
      workspaceId,
      name: connectionName(),
      notionToken: notionToken(),
      type: 'NOTION'
    })
  }
  return (
    <div class="flex h-screen flex-col">
      <h1 class="text-slate-11 text-2xl font-bold">Connections</h1>
      <h2 class="text-slate-12">Existing connections</h2>
      <Switch>
        <Match when={query.isLoading}>
          <p class="text-slate-12">Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p class="text-slate-12">Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data.length}>
          <ul>
            <For each={query.data}>
              {(connection) => (
                <li>
                  <p class="text-slate-12">{connection.name}</p>
                </li>
              )}
            </For>
          </ul>
          <form class="mt-4" onSubmit={onSubmitFetchConnections}>
            <Button type="submit" disabled={fetchConnectionMutation.isLoading}>
              Sync Connections
            </Button>
          </form>
        </Match>
      </Switch>
      <h2 class="text-slate-12">Create new connection</h2>
      <Switch>
        <Match when={fetchConnectionMutation.isError}>
          <p class="text-slate-12">
            Error: {JSON.stringify(fetchConnectionMutation.error)}
          </p>
        </Match>
        <Match when={fetchConnectionMutation.isSuccess}>
          <p class="text-slate-12">Success!</p>
        </Match>
        <Match when={fetchConnectionMutation.isLoading}>
          <p class="text-slate-12">Loading...</p>
        </Match>
      </Switch>

      <form class="mt-4 max-w-md space-y-4" onSubmit={onSubmitCreateConnection}>
        <Input
          type="text"
          label="Connection Name"
          name="connection-name"
          signal={[connectionName, setConnectionName]}
        />
        <Input
          type="text"
          label="Notion Token"
          name="notion-token"
          signal={[notionToken, setNotionToken]}
        />
        <Button type="submit" disabled={createConnectionMutation.isLoading}>
          Create Connection
        </Button>
      </form>

      <Switch>
        <Match when={createConnectionMutation.isError}>
          <p class="text-slate-12">
            Error: {JSON.stringify(createConnectionMutation.error)}
          </p>
        </Match>
        <Match when={createConnectionMutation.isSuccess}>
          <p class="text-slate-12">Success!</p>
        </Match>
        <Match when={createConnectionMutation.isLoading}>
          <p class="text-slate-12">Loading...</p>
        </Match>
      </Switch>
    </div>
  )
}

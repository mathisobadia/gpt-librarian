import { useParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Component, createSignal, For, Match, Switch } from "solid-js";
import { createConnection } from "../queries/create-connection";
import { fetchConnections } from "../queries/fetch-connections";
import { listConnections } from "../queries/list-connections";

export const Notion: Component = () => {
  const fetchConnectionMutation = createMutation(
    ["connections"],
    fetchConnections
  );
  const createConnectionMutation = createMutation(
    ["connections"],
    createConnection
  );
  const params = useParams();
  const workspaceId = params.workspaceId;
  const listWorkspaceConnections = () => listConnections(workspaceId);
  const [connectionName, setConnectionName] = createSignal("");
  const [notionToken, setNotionToken] = createSignal("");
  const query = createQuery(() => ["connections"], listWorkspaceConnections);
  const onSubmitFetchConnections = (e: Event) => {
    e.preventDefault();
    fetchConnectionMutation.mutate(workspaceId);
  };
  const onSubmitCreateConnection = (e: Event) => {
    e.preventDefault();
    createConnectionMutation.mutate({
      workspaceId,
      name: connectionName(),
      notionToken: notionToken(),
      type: "NOTION",
    });
  };
  return (
    <div class="flex flex-col h-screen">
      <h1 class="text-2xl font-bold text-gray-600 dark:text-gray-300">
        Connections
      </h1>
      <h2>Existing connections</h2>
      <Switch>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data && query.data.length}>
          <ul>
            <For each={query.data}>
              {(connection) => (
                <li>
                  <p>{connection.name}</p>
                </li>
              )}
            </For>
          </ul>
          <form class="mt-4" onSubmit={onSubmitFetchConnections}>
            <button
              disabled={fetchConnectionMutation.isLoading}
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Sync Connections
            </button>
          </form>
        </Match>
      </Switch>
      <h2>Create new connection</h2>
      <Switch>
        <Match when={fetchConnectionMutation.isError}>
          <p>Error: {JSON.stringify(fetchConnectionMutation.error)}</p>
        </Match>
        <Match when={fetchConnectionMutation.isSuccess}>
          <p>Success!</p>
        </Match>
        <Match when={fetchConnectionMutation.isLoading}>
          <p>Loading...</p>
        </Match>
      </Switch>

      <form class="mt-4" onSubmit={onSubmitCreateConnection}>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Connection Name
        </label>
        <input
          type="text"
          onInput={(e) => setConnectionName(e.currentTarget.value)}
          value={connectionName()}
        />
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Notion Token
        </label>
        <input
          type="text"
          onInput={(e) => setNotionToken(e.currentTarget.value)}
          value={notionToken()}
        />
        <button
          disabled={createConnectionMutation.isLoading}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Create Connection
        </button>
      </form>

      <Switch>
        <Match when={createConnectionMutation.isError}>
          <p>Error: {JSON.stringify(createConnectionMutation.error)}</p>
        </Match>
        <Match when={createConnectionMutation.isSuccess}>
          <p>Success!</p>
        </Match>
        <Match when={createConnectionMutation.isLoading}>
          <p>Loading...</p>
        </Match>
      </Switch>
    </div>
  );
};

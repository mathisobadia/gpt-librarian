import { A, Link, Outlet } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Component, For, Match, Switch } from "solid-js";
import { listUserWorkspaces } from "../queries/list-user-workspaces";

export const Workspaces: Component = () => {
  const query = createQuery(() => ["workspaces"], listUserWorkspaces);
  return (
    <div>
      <Switch>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {JSON.stringify(query.error)}</p>
        </Match>
        <Match when={query.isSuccess && query.data}>
          <ul>
            <For each={query.data}>
              {(workspaceId) => (
                <li>
                  <Link href={`/workspaces/${workspaceId}`}>{workspaceId}</Link>
                </li>
              )}
            </For>
          </ul>
        </Match>
      </Switch>
      <Outlet />
    </div>
  );
};

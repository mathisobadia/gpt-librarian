import { createQuery } from "@tanstack/solid-query";
import { Button } from "../base-ui/button";
import { Component, Match, Switch } from "solid-js";
import { Logo } from "../base-ui/logo";
import { listUserWorkspaces } from "../queries/list-user-workspaces";
import { Navigate } from "@solidjs/router";

export const Home: Component = () => {
  const query = createQuery(() => ["workspaces"], listUserWorkspaces, {
    retry: false,
  });
  return (
    <div class="flex flex-col items-center justify-center h-screen">
    <Switch>
      <Match when={query.data && query.data.length}>
        <Navigate href={`/workspaces/${query.data![0].workspaceId}`} />
      </Match>
      <Match when={query.isError}>
      <h1 class="text-2xl font-bold text-slate-12 font-sans">
        GPT Librarian
      </h1>
      <Logo size={300}></Logo>
      <Button intent="primary" href="sign-up">Get Started</Button>
      </Match>
    </Switch>
    </div>
  );
};

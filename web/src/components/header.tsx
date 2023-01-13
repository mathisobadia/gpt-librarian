import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Component, For, Match, Switch } from "solid-js";
import { Button } from "../base-ui/button";
import { GithubLogo } from "../base-ui/github-logo";
import { Logo } from "../base-ui/logo";
import { ThemeToggler } from "../base-ui/theme-toggler";
import { listUserWorkspaces } from "../queries/list-user-workspaces";

export const Header: Component = () => {
  const query = createQuery(() => ["workspaces"], listUserWorkspaces, {
    retry: false,
  });

  const onLogout = (e: Event) => {
    e.preventDefault();
    fetch(import.meta.env.VITE_REST_URL + `/logout`, {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (res.status === 200) {
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    });
  };
  return (
    <div class="relative bg-slate-2">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex justify-between items-center border-b-2 border-slate-6 py-1">
          <div class="flex justify-start">
            <A href="/">
              <span class="sr-only">GPT Librarian</span>
            </A>
            <Logo size={50} />
          </div>
          <div class="-my-2 -mr-2 md:hidden">
            <Button>
              <span class="sr-only">Open menu</span>
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </Button>
          </div>
          <div class="flex flex-row items-center justify-end flex-gap gap-2"></div>
          <div class="hidden md:flex flex-row items-center justify-start flex-gap gap-2">
            <Switch>
              <Match when={query.data && query.data.length}>
                <Button onClick={onLogout} intent="ghost">
                  Log out
                </Button>
              </Match>
              <Match when={query.error}>
                <Button intent="ghost" href="/sign-in">
                  Sign in
                </Button>
                <Button href="/sign-up">Sign up</Button>
              </Match>
            </Switch>
            <Button
              size="small"
              href="https://github.com/mathisobadia/gpt-librarian"
              intent="ghost"
            >
              <GithubLogo />
            </Button>
            <ThemeToggler />
          </div>
        </div>
      </div>
    </div>
  );
};

import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { Button } from "../base-ui/button";

export const Header: Component = () => {
  return (
    <div class="relative bg-slate-2">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="flex items-center justify-between border-b-2 border-slate-6 py-6 md:justify-start md:space-x-10">
          <div class="flex justify-start lg:w-0 lg:flex-1">
            <a href="#">
              <span class="sr-only">Your Company</span>
            </a>
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
          <nav class="hidden space-x-10 md:flex">
            <A
              href="/workspaces"
              class="text-base font-medium text-slate-11 hover:text-slate-12"
            >
              Workspaces
            </A>
          </nav>
          <div class="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            <A
              href="/sign-in"
              class="whitespace-nowrap text-base font-medium text-slate-11 hover:text-slate-12"
            >
              Sign in
            </A>
            <Button href="/sign-up">Sign up</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

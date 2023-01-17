import { Button } from '../base-ui/button'
import { Component, Match, Switch } from 'solid-js'
import { listUserWorkspacesQuery } from '../queries/list-user-workspaces'
import { A, Navigate } from '@solidjs/router'
import { Icon } from 'solid-heroicons'
import {
  documentArrowDown,
  documentMagnifyingGlass,
  magnifyingGlassPlus,
  questionMarkCircle
} from 'solid-heroicons/outline'

export const Home: Component = () => {
  const query = listUserWorkspacesQuery()
  return (
    <>
      <Switch>
        <Match when={query.isLoading}>
          <div class="flex h-screen flex-col items-center justify-center">
            <div role="status">
              <svg
                aria-hidden="true"
                class="text-slate-4 fill-cyan-9 mr-2 h-8 w-8 animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </Match>
        <Match when={query.data?.length}>
          <Navigate href={`/workspaces/${query.data![0].workspaceId}`} />
        </Match>
        <Match when={query.isError}>
          <div class="bg-slate-1 w-full">
            <div class="flex h-[70vh] flex-col items-center justify-center">
              <div class="relative px-6 lg:px-8">
                <div class="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
                  <div>
                    <div class="hidden sm:mb-8 sm:flex sm:justify-center" />
                    <div>
                      <h1 class="text-slate-12 text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                        GPT Librarian understands all your docs
                      </h1>
                      <p class="text-slate-11 mt-6 text-lg leading-8 sm:text-center">
                        Start connecting your docs today and find the answers
                        you need in seconds.
                      </p>
                      <div class="mt-8 flex gap-x-4 sm:justify-center">
                        <Button intent="primary" href="sign-up">
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr class="bg-slate-6 my-8 h-px border-0" />
            <div class="bg-slate-1">
              <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mt-20 max-w-lg sm:mx-auto md:max-w-none">
                  <div class="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
                    <div class="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                      <div class="bg-cyan-6 text-cyan-12 flex h-12 w-12 items-center justify-center rounded-xl sm:shrink-0">
                        <Icon path={questionMarkCircle} />
                      </div>
                      <div class="sm:min-w-0 sm:flex-1">
                        <p class="text-slate-12 text-lg font-semibold leading-8">
                          Ask me anything
                        </p>
                        <p class="text-slate-11 mt-2 text-base leading-7">
                          Ask questions about your documentation and get answers
                          from our AI chatbot
                        </p>
                      </div>
                    </div>

                    <div class="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                      <div class="bg-cyan-6 text-cyan-12 flex h-12 w-12 items-center justify-center rounded-xl sm:shrink-0">
                        <Icon path={documentMagnifyingGlass} />
                      </div>
                      <div class="sm:min-w-0 sm:flex-1">
                        <p class="text-slate-12 text-lg font-semibold leading-8">
                          Search that's intuitive
                        </p>
                        <p class="text-slate-11 mt-2 text-base leading-7">
                          Perform semantic searches across all your docs in a
                          single place. No more context switching
                        </p>
                      </div>
                    </div>

                    <div class="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                      <div class="bg-cyan-6 text-cyan-12 flex h-12 w-12 items-center justify-center rounded-xl sm:shrink-0">
                        <Icon path={documentArrowDown} />
                      </div>
                      <div class="sm:min-w-0 sm:flex-1">
                        <p class="text-slate-12 text-lg font-semibold leading-8">
                          Connect from multiple sources
                        </p>
                        <p class="text-slate-11 mt-2 text-base leading-7">
                          Connect your Notion databases, Google Docs, Github
                          repos and more
                        </p>
                      </div>
                    </div>

                    <div class="relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row">
                      <div class="bg-cyan-6 text-cyan-12 flex h-12 w-12 items-center justify-center rounded-xl sm:shrink-0">
                        <Icon path={magnifyingGlassPlus} />
                      </div>
                      <div class="sm:min-w-0 sm:flex-1">
                        <p class="text-slate-12 text-lg font-semibold leading-8">
                          Find out what is missing from your docs
                        </p>
                        <p class="text-slate-11 mt-2 text-base leading-7">
                          Keep track of all the answers that don't have an
                          answer and generate missing documentation and
                          processes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr class="bg-slate-6 my-8 h-px border-0" />
            <footer class="rounded-lg p-4 shadow md:flex md:items-center md:justify-between md:p-6 ">
              <span class="text-slate-11 text-sm sm:text-center">
                © {new Date().getFullYear()}{' '}
                <a href="https://flowbite.com/" class="hover:underline">
                  GPT Librarian™
                </a>
                . All Rights Reserved.
              </span>
              <ul class="text-slate-11 mt-3 flex flex-wrap items-center text-sm  sm:mt-0">
                <li class="mr-4 md:mr-6">
                  <a href="https://twitter.com/mathisob" class="mr-4 md:mr-6 ">
                    <svg
                      class="inline fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 248 204"
                    >
                      <path d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <A
                    href="/privacy-policy"
                    class="mr-4 hover:underline md:mr-6"
                  >
                    Privacy Policy
                  </A>
                </li>
                <li>
                  <a
                    href="mail:contact@gpt-librarian.com"
                    class="hover:underline"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </footer>
          </div>
        </Match>
      </Switch>
    </>
  )
}

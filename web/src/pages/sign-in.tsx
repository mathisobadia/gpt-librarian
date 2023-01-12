import { Component, createSignal, Match, Switch } from "solid-js";
import { Button } from "../base-ui/button";
import { Logo } from "../base-ui/logo";
import { useLocation } from "@solidjs/router";
export const SignIn: Component = () => {
  const queryParams = useLocation().query;
  const emailsent = queryParams.emailsent;
  const [email, setEmail] = createSignal("");
  const onSubmit = (e: Event) => {
    e.preventDefault();
    location.href =
      import.meta.env.VITE_REST_URL + `/auth/link/authorize?email=${email()}`;
  };
  return (
    <div class="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-center m-y-4">
          <Logo size={200} />
        </div>
        <Switch>
          <Match when={emailsent}>
            <div class="rounded-md bg-slate-3 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg
                    class="h-5 w-5 text-slate-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-slate-12">Email sent!</h3>
                  <div class="mt-2 text-sm text-slate-11">
                    <p>
                      We've sent you an email with a link to sign in. If you
                      don't see it, check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Match>
          <Match when={!emailsent}>
            <div>
              <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-slate-12">
                Sign in to your account
              </h2>
            </div>
            <form onSubmit={onSubmit} class="mt-8 space-y-6">
              <div>
                <label for="email-address" class="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autocomplete="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                  class="bg-slate-2 relative block w-full appearance-none rounded-md border border-slate-6 px-3 py-2 text-slate-12 placeholder-slate-11 focus:ring-2 focus:outline-none focus:ring-sky-7 sm:text-sm"
                  placeholder="Email address"
                ></input>
              </div>
              <div>
                <Button type="submit" additionalClass="w-full">
                  Sign in
                </Button>
              </div>
            </form>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

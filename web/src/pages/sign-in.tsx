import { Component, createSignal } from "solid-js";
import { Button } from "../base-ui/button";
export const SignIn: Component = () => {
  const [email, setEmail] = createSignal("");
  const onSubmit = (e: Event) => {
    e.preventDefault();
    location.href =
      import.meta.env.VITE_REST_URL + `/auth/link/authorize?email=${email()}`;
  };
  return (
    <div class="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <img class="mx-auto h-52 w-auto" src="/logo.png" alt="logo"></img>
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
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

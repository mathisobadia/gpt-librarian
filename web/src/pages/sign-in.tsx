import { Component, createSignal } from "solid-js";
export const SignIn: Component = () => {
  const [email, setEmail] = createSignal("");
  const onSubmit = (e: Event) => {
    e.preventDefault();
    location.href =
      import.meta.env.VITE_REST_URL + `/auth/link/authorize?email=${email()}`;
  };
  return (
    <div class="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div>
          <img
            class="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          ></img>
          <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={onSubmit} class="mt-8 space-y-6">
          <div class="-space-y-px rounded-md shadow-sm">
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
                class="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
              ></input>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

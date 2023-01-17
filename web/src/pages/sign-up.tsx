import { Component, createSignal, Match, Switch } from 'solid-js'
import { Button } from '../base-ui/button'
import { Logo } from '../base-ui/logo'
import { useLocation } from '@solidjs/router'
import { Input } from '../base-ui/input'
import { Icon } from 'solid-heroicons'
import { envelope } from 'solid-heroicons/outline'
export const SignUp: Component = () => {
  const queryParams = useLocation().query
  const emailsent = queryParams.emailsent
  const [email, setEmail] = createSignal('')
  const [name, setName] = createSignal('')
  const onSubmit = (e: Event) => {
    e.preventDefault()
    location.href =
      import.meta.env.VITE_REST_URL +
      `/auth/link/authorize?email=${email()}&name=${name()}`
  }
  return (
    <div class="flex h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="my-4 flex items-center justify-center">
          <Logo size={200} />
        </div>
        <Switch>
          <Match when={emailsent}>
            <div class="bg-slate-3 rounded-md p-4">
              <div class="flex">
                <div class="shrink-0">
                  <div class="text-slate-11 h-8 w-8">
                    <Icon path={envelope} />
                  </div>
                </div>
                <div class="ml-3">
                  <h3 class="text-slate-12 text-sm font-medium">Email sent!</h3>
                  <div class="text-slate-11 mt-2 text-sm">
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
              <h2 class="text-slate-12 mt-6 text-center text-3xl font-bold tracking-tight">
                Sign up to GPT Librarian
              </h2>
            </div>
            <form onSubmit={onSubmit} class="mt-8 space-y-6">
              <div class="flex flex-col gap-1">
                <Input
                  name="email"
                  type="email"
                  signal={[email, setEmail]}
                  required
                  label="Email address"
                 />
                <Input
                  name="name"
                  type="name"
                  signal={[name, setName]}
                  required
                  label="Name"
                 />
              </div>
              <div>
                <Button type="submit" additionalClass="w-full">
                  Sign up
                </Button>
              </div>
            </form>
          </Match>
        </Switch>
      </div>
    </div>
  )
}

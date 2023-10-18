import { type Component, createSignal, Match, Show, Switch } from 'solid-js'
import { Button } from '../base-ui/button'
import { Logo } from '../base-ui/logo'
import { useLocation } from '@solidjs/router'
import { Input } from '../base-ui/input'
import { EmailSent } from '../components/email-sent'
export const SignUp: Component = () => {
  const queryParams = useLocation().query
  const emailsent = queryParams.emailsent
  const error = queryParams.error
  const [email, setEmail] = createSignal('')
  const [name, setName] = createSignal('')
  console.log(error)
  const getSearchParams = () => new URLSearchParams({
    email: email(),
    name: name(),
    type: 'signup'
  }).toString()
  const onSubmit = (e: Event) => {
    e.preventDefault()
    location.href =
      import.meta.env.VITE_REST_URL +
      `/auth/link/authorize?${getSearchParams()}`
  }
  return (
    <div class="flex h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="my-4 flex items-center justify-center">
          <Logo size={200} />
        </div>
        <Show when={error === 'usernotfound'}>
          <div class="border-red-7 bg-red-3 text-red-12 relative rounded border px-4 py-3" role="alert">
            <span class="block sm:inline">User was not found, please sign up to GPT librarian</span>
          </div>
        </Show>
        <Switch>
          <Match when={emailsent}>
            <EmailSent/>
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
                  placeholder='jeanclaude@vandamme.com'
                  signal={[email, setEmail]}
                  required
                  label="Email address"
                 />
                <Input
                  name="name"
                  type="name"
                  placeholder='Jean-Claude Van Damme'
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

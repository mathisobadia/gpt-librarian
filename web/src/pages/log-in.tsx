import { type Component, createSignal, Match, Switch } from 'solid-js'
import { Button } from '../base-ui/button'
import { Logo } from '../base-ui/logo'
import { useLocation } from '@solidjs/router'
import { Input } from '../base-ui/input'
import { EmailSent } from '../components/email-sent'
export const LogIn: Component = () => {
  const queryParams = useLocation().query
  const emailsent = queryParams.emailsent
  const [email, setEmail] = createSignal('')
  const getSearchParams = () => new URLSearchParams({
    email: email(),
    type: 'login'
  }).toString()
  const onSubmit = (e: Event) => {
    e.preventDefault()
    location.href =
      import.meta.env.VITE_REST_URL + `/auth/link/authorize?${getSearchParams()}`
  }
  return (
    <div class="flex h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="my-4 flex items-center justify-center">
          <Logo size={200} />
        </div>
        <Switch>
          <Match when={emailsent}>
            <EmailSent/>
          </Match>
          <Match when={!emailsent}>
            <div>
              <h2 class="text-slate-12 mt-6 text-center text-3xl font-bold tracking-tight">
                Log in to your account
              </h2>
            </div>
            <form onSubmit={onSubmit} class="mt-8 space-y-6">
              <div>
                <label for="email-address" class="sr-only">
                  Email address
                </label>
                <Input
                  name="email"
                  type="email"
                  signal={[email, setEmail]}
                  required
                  label="Email address"
                  placeholder='jeanclaude@vandamme.com'
                 />
              </div>
              <div>
                <Button type="submit" additionalClass="w-full">
                  Log in
                </Button>
              </div>
            </form>
          </Match>
        </Switch>
      </div>
    </div>
  )
}

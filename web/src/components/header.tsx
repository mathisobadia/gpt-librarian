import { DropdownMenu } from '@kobalte/core'
import { A } from '@solidjs/router'
import { type Component, Match, Switch } from 'solid-js'
import { Button } from '../base-ui/button'
import { GithubLogo } from '../base-ui/github-logo'
import { Logo } from '../base-ui/logo'
import { ThemeToggler } from '../base-ui/theme-toggler'
import { useSession } from '../queries/query-utils'

export const Header: Component = () => {
  const { claims, logout } = useSession()
  console.log('claims', claims())
  const onLogout = (e: Event) => {
    e.preventDefault()
    logout()
  }
  return (
    <nav class="fixed top-0 z-10 w-full backdrop-blur-lg">
      <div class="mx-auto max-w-7xl px-4">
        <div class="border-slate-6 flex items-center justify-between border-b-2 py-1">
          <div class="flex justify-start">
            <A href="/">
              <span class="sr-only">GPT Librarian</span>
            </A>
            <Button intent="ghost" href="/">
              <Logo size={40} />
            </Button>
          </div>
          <div class="flex flex-row items-center justify-end gap-2" />
          <div class="flex flex-row items-center justify-start gap-2">
            <Switch>
              <Match when={claims()?.properties.name}>
                {/* <>{claims()?.properties.name}</> */}
                <Button onClick={onLogout} intent="ghost">
                  Log out
                </Button>
              </Match>
              <Match when={!claims()}>
                <Button intent="ghost" href="/log-in">
                  <span>Log in</span>
                </Button>
                <Button href="/sign-up">
                  <span>Sign up</span>
                </Button>
              </Match>
            </Switch>
            <div class="hidden sm:flex ">
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
    </nav>
  )
}

const LoggedInDropdown: Component = (claims) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="dropdown-menu__trigger">
        <DropdownMenu.Icon class="dropdown-menu__trigger-icon">
          <div class="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
            <span class="font-medium text-gray-600 dark:text-gray-300">JL</span>
          </div>
        </DropdownMenu.Icon>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="dropdown-menu__content">
          <DropdownMenu.Item class="dropdown-menu__item">
            Commit <div class="dropdown-menu__item-right-slot">⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="dropdown-menu__item">
            Push <div class="dropdown-menu__item-right-slot">⇧+⌘+K</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item class="dropdown-menu__item" isDisabled>
            Update Project <div class="dropdown-menu__item-right-slot">⌘+T</div>
          </DropdownMenu.Item>
          <DropdownMenu.Arrow />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

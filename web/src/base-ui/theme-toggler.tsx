import { Icon } from 'solid-heroicons'
import { moon, sun } from 'solid-heroicons/outline'
import { createEffect, createSignal, Match, Switch } from 'solid-js'
import { Button } from './button'

const initializeTheme = () => {
  let theme
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    theme = localStorage.getItem('theme') as 'light' | 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark'
  } else {
    theme = 'light'
  }
  return theme
}

export const ThemeToggler = () => {
  const [theme, setTheme] = createSignal<string>(initializeTheme())

  createEffect(() => {
    const root = document.documentElement
    if (theme() === 'light') {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  })

  return (
    <div>
      <Button
        size="small"
        intent="ghost"
        onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      >
        <Switch>
          <Match when={theme() === 'light'}>{darkThemeIcon()}</Match>
          <Match when={theme() === 'dark'}>{lightThemeIcon()}</Match>
        </Switch>
      </Button>
    </div>
  )
}

const lightThemeIcon = () => {
  return <Icon path={sun} />
}

const darkThemeIcon = () => {
  return <Icon path={moon} />
}

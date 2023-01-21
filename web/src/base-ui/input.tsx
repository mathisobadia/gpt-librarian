import { Icon } from 'solid-heroicons'
import { Component, createUniqueId, Signal, Switch, Match, JSXElement } from 'solid-js'
type InputProps = {
  signal: Signal<string>
  label: string
  type: string
  name?: string
  required?: boolean
  icon?: { path: JSXElement }
}
export const Input: Component<InputProps> = (props) => {
  const id = createUniqueId()
  return (
    <>
      <label for={id} class="sr-only">
        {props.label}
      </label>
      <Switch>
        <Match when={props.icon}>
          <div class="text-slate-11 focus-within:text-slate-12 relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <Icon class="text-slate-11 h-4 w-4" path={props.icon!} />
            </span>
            <input
              id={id}
              name={props.name ?? id}
              type={props.type}
              autocomplete={props.type}
              required={props.required}
              value={props.signal[0]()}
              onInput={(e) => props.signal[1](e.currentTarget.value)}
              class="bg-slate-2 border-slate-6 text-slate-12 placeholder:text-slate-11 focus-visible:ring-cyan-7 w-full appearance-none rounded-md border py-2 px-3 pl-10 text-sm focus:outline-none focus-visible:ring-2 sm:text-sm"
              placeholder={props.label}
       />
          </div>
        </Match>
        <Match when={!props.icon}>
          <input
            id={id}
            name={props.name ?? id}
            type={props.type}
            autocomplete={props.type}
            required={props.required}
            value={props.signal[0]()}
            onInput={(e) => props.signal[1](e.currentTarget.value)}
            class="bg-slate-2 border-slate-6 text-slate-12 placeholder:text-slate-11 focus-visible:ring-cyan-7 relative block w-full appearance-none rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2 sm:text-sm"
            placeholder={props.label}
       />
        </Match>
      </Switch>

    </>
  )
}

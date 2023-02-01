import { Icon } from 'solid-heroicons'
import { Component, Signal, Switch, Match, JSXElement } from 'solid-js'
import { TextField } from '@kobalte/core'
type InputProps = {
  signal: Signal<string>
  label: string
  placeholder?: string
  type: string
  name?: string
  required?: boolean
  icon?: { path: JSXElement }
}
export const Input: Component<InputProps> = (props) => {
  return (
    <Switch>
      <Match when={props.icon}>
        <div class="text-slate-11 focus-within:text-slate-12 relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-2">
            <Icon class="text-slate-11 h-4 w-4" path={props.icon!} />
          </span>
          <TextField.Root value={props.signal[0]()} onValueChange={props.signal[1]} name={props.name} isRequired={props.required}>
            <TextField.Label class="text-slate-11 text-sm lg:text-lg">
              {props.label}
            </TextField.Label>
            <TextField.Input class="bg-slate-2 border-slate-6 text-slate-12 placeholder:text-slate-11 focus-visible:ring-cyan-7 w-full appearance-none rounded-md border py-2 px-3 pl-10 text-sm focus:outline-none focus-visible:ring-2"
              type={props.type}
              placeholder={props.placeholder}
              autocomplete={props.type}/>
          </TextField.Root>
        </div>
      </Match>
      <Match when={!props.icon}>
        <TextField.Root value={props.signal[0]()} onValueChange={props.signal[1]} name={props.name} isRequired={props.required}>
          <TextField.Label class="text-slate-11 text-sm lg:text-lg" >
            {props.label}
          </TextField.Label>
          <TextField.Input class="bg-slate-2 border-slate-6 text-slate-12 placeholder:text-slate-11 focus-visible:ring-cyan-7 relative block w-full appearance-none rounded-md border px-3 py-2 focus:outline-none focus-visible:ring-2"
            type={props.type}
            placeholder={props.placeholder}
            autocomplete={props.type}/>
        </TextField.Root>
      </Match>
    </Switch>
  )
}

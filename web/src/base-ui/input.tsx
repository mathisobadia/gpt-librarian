import { Component, createUniqueId, Signal } from 'solid-js'
type InputProps = {
  signal: Signal<string>
  label: string
  type: string
  name?: string
  required?: boolean
}
export const Input: Component<InputProps> = (props) => {
  const id = createUniqueId()
  return (
    <>
      <label for={id} class="sr-only">
        {props.label}
      </label>
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
    </>
  )
}

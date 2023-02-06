import { Icon } from 'solid-heroicons'
import { Component, Signal, JSXElement, ParentComponent } from 'solid-js'
import { TextField } from '@kobalte/core'
export type InputProps = {
  signal: Signal<string>
  label: string
  placeholder: string
  type: string
  name?: string
  required?: boolean
}

export type InputWithIconProps = InputProps & {
  icon: { path: JSXElement }
}
export const InputWithIcon: Component<InputWithIconProps> = (props) => {
  return (
    (<Root signal={props.signal} name={props.name} required={props.required}>
      <Label label={props.label} />
      <div class="text-slate-11 focus-within:text-slate-12 relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-2">
          <Icon class="text-slate-11 h-4 w-4" path={props.icon} />
        </span>
        <InputField additionalClasses='pl-10' type={props.type} placeholder={props.placeholder}/>
      </div>
    </Root>)
  )
}

export const Input: ParentComponent<InputProps> = (props) =>
  (<Root signal={props.signal} name={props.name} required={props.required}>
    <Label label={props.label} />
    <InputField type={props.type} placeholder={props.placeholder}/>
  </Root>)

const Label: Component<Pick<InputProps, 'label'>> = (props) => {
  return (<TextField.Label class="text-slate-12 text-sm lg:text-lg" >
    {props.label}
  </TextField.Label>)
}

const Root: ParentComponent<Pick<InputProps, 'signal' | 'name' | 'required'>> = (props) => {
  return (
    <TextField.Root value={props.signal[0]()} onValueChange={props.signal[1]} name={props.name} isRequired={props.required}>
      {props.children}
    </TextField.Root>
  )
}

const InputField: Component<Pick<InputProps, 'type' | 'placeholder'> & { additionalClasses?: string }> = (props) => {
  return (<TextField.Input class={'bg-slate-2 border-slate-6 text-slate-12 focus:border-slate-6 placeholder:text-slate-11 focus-visible:ring-cyan-7 w-full appearance-none rounded-md border py-2 px-3 text-sm focus:outline-none focus-visible:ring-2' + (props.additionalClasses ? ' ' + props.additionalClasses : '')}
    type={props.type}
    placeholder={props.placeholder}
    autocomplete={props.type}/>)
}

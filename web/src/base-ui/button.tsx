import { A } from '@solidjs/router'
import { Button as Btn } from '@kobalte/core'
import { Match, type ParentComponent, Switch } from 'solid-js'
import { cva } from 'class-variance-authority'
import { SmallSpinner as Spinner } from './spinner'

type ButtonProps = {
  disabled?: boolean
  href?: string
  intent?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  additionalClass?: string
  size?: 'small' | 'medium'
  loading?: boolean
  onClick?: (e: Event) => void
}
export const button = cva(
  [
    'font-sans',
    'rounded',
    'disabled:opacity-50',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-cyan-7',
    'disabled:pointer-events-none',
    'text-center'
  ],
  {
    variants: {
      intent: {
        primary: [
          'bg-cyan-9',
          'hover:bg-cyan-10',
          'text-white',
          'font-bold'
        ],
        secondary: [
          'bg-cyan-3',
          'hover:bg-cyan-4',
          'active:bg-cyan-5',
          'text-cyan-11',
          'hover:text-cyan-12',
          'border-solid',
          'border',
          'border-cyan-7',
          'hover:boder-cyan-8',
          'font-bold'
        ],
        ghost: [
          'bg-transparent',
          'text-slate-11',
          'font-bold',
          'hover:text-slate-12',
          'hover:underline',
          'hover:underline-offset-4'
        ]
      },
      size: {
        small: ['text-sm', 'py-1', 'px-2'],
        medium: ['text-base', 'py-2', 'px-4']
      }
    },
    defaultVariants: {
      intent: 'primary',
      size: 'medium'
    }
  }
)
export const Button: ParentComponent<ButtonProps> = (props) => {
  const fullClass = () => button({
    class: props.additionalClass,
    intent: props.intent,
    size: props.size
  })

  return (
    <Switch>
      <Match when={props.href}>
        <Switch>
          <Match when={props.disabled}>
            <span class={fullClass()} >
              <InnerButton {...props}/>
            </span>
          </Match>
          <Match when={!props.disabled}>
            <A class={fullClass()} href={props.href!}>
              <InnerButton {...props}/>
            </A>
          </Match>
        </Switch>
      </Match>
      <Match when={!props.href}>
        <Btn.Root
          onClick={props.onClick}
          class={fullClass()}
          isDisabled={props.disabled}
          type={props.type ?? 'button'}
        >
          <InnerButton {...props}/>
        </Btn.Root>
      </Match>
    </Switch>
  )
}

const InnerButton: ParentComponent<ButtonProps> = (props) => {
  return (
    <span class='relative'><span class='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' classList={{ invisible: !props.loading }}><Spinner/></span>
      <span classList={{ invisible: props.loading }}>{props.children}</span></span>
  )
}

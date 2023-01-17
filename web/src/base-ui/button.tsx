import { A } from '@solidjs/router'
import { Button as Btn } from 'solid-headless'
import { Match, ParentComponent, Switch } from 'solid-js'
import { cva } from 'class-variance-authority'

interface ButtonProps {
  disabled?: boolean
  href?: string
  intent?: 'primary' | 'ghost'
  type?: 'button' | 'submit'
  additionalClass?: string
  size?: 'small' | 'medium'
  onClick?: (e: Event) => void
}
export const Button: ParentComponent<ButtonProps> = (props) => {
  const button = cva(
    [
      'font-sans',
      'rounded',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'focus:outline-none',
      'focus:ring-2'
    ],
    {
      variants: {
        intent: {
          primary: [
            'bg-cyan-9',
            'hover:bg-cyan-10',
            'text-white',
            'font-bold',
            'focus:ring-cyan-7'
          ],
          ghost: [
            'bg-transparent',
            'hover:outline',
            'hover:outline-cyan-7',
            'hover:outline-2',
            'text-slate-11',
            'hover:text-slate-12',
            'focus:ring-slate-7'
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
            <span class={fullClass()}>{props.children}</span>
          </Match>
          <Match when={!props.disabled}>
            <A class={fullClass()} href={props.href!}>
              {props.children}
            </A>
          </Match>
        </Switch>
      </Match>
      <Match when={!props.href}>
        <Btn
          onClick={props.onClick}
          class={fullClass()}
          disabled={props.disabled}
          type={props.type ?? 'button'}
        >
          {props.children}
        </Btn>
      </Match>
    </Switch>
  )
}

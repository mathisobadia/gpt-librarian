import { A } from '@solidjs/router'
import { Button as Btn } from 'solid-headless'
import { Match, ParentComponent, Switch } from 'solid-js'
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
export const Button: ParentComponent<ButtonProps> = (props) => {
  const button = cva(
    [
      'font-sans',
      'rounded',
      'disabled:opacity-50',
      'focus:outline-none',
      'focus-visible:ring-2',
      'text-center'
    ],
    {
      variants: {
        intent: {
          primary: [
            'bg-cyan-9',
            'hover:bg-cyan-10',
            'disabled:bg-cyan-9',
            'text-white',
            'font-bold',
            'focus-visible:ring-cyan-7'
          ],
          secondary: [
            'bg-slate-9',
            'disabled:bg-slate-9',
            'hover:bg-slate-10',
            'text-white',
            'border-solid',
            'border-2',
            'border-cyan-7',
            'hover:boder-cyan-8',
            'font-bold',
            'focus-visible:ring-slate-7'
          ],
          ghost: [
            'bg-transparent',
            'hover:outline',
            'hover:outline-cyan-7',
            'hover:outline-2',
            'text-slate-11',
            'hover:text-slate-12',
            'focus-visible:ring-slate-7'
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
        <Btn
          onClick={props.onClick}
          class={fullClass()}
          disabled={props.disabled}
          type={props.type ?? 'button'}
        >
          <InnerButton {...props}/>
        </Btn>
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

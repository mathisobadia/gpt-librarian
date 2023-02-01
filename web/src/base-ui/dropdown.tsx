import { Select } from '@kobalte/core'
import { Icon } from 'solid-heroicons'
import { check, chevronUpDown } from 'solid-heroicons/outline'
import { createSignal, For, Component } from 'solid-js'

export type DropDownOption = {
  name: string
  value: string
}
export type DropDownProps = {
  options: DropDownOption[]
  value?: string
  onChange?: (value: DropDownOption) => void
}

export const DropDown: Component<DropDownProps> = (props) => {
  const initialValue = () => {
    return props.options.find((option) => option.value === props.value) ?? props.options[0]
  }
  const onSelectChange = (value: string) => {
    if (value) {
      const option = props.options.find((option) => option.value === value)
      if (option) {
        setSelected(option)
        if (props.onChange) {
          props.onChange(option)
        }
      }
    }
  }

  const [selected, setSelected] = createSignal(initialValue())
  return (
    <Select.Root
      value={selected().value}
      onValueChange={onSelectChange}
    >
      <div class="relative mt-1 max-w-lg">
        <Select.Trigger class="bg-slate-3 focus-visible:ring-slate-7 relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:ring-2 sm:text-sm">
          <Select.Value class="text-slate-11 block truncate px-3"/>
          <Select.Icon class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon
              class="text-slate-11 h-5 w-5"
              aria-hidden="true"
              path={chevronUpDown}
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Listbox class="bg-slate-3 ring-slate-7 absolute max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 focus:outline-none sm:text-sm">
              <For each={props.options}>
                {(person) => (
                  <Select.Item
                    class="group relative flex items-center focus:outline-none"
                    value={person.value}
                    >
                    <Select.ItemLabel
                      class='text-slate-11 group-hover:text-slate-12 group-hover:bg-cyan-5 relative w-full cursor-default select-none py-2 pl-10 pr-4'
                        >
                      <span
                        class='block truncate font-normal'
                          >
                        {person.name}
                      </span>
                    </Select.ItemLabel>
                    <Select.ItemIndicator class="absolute left-0 top-0 inline-flex items-center justify-center pl-3 pt-3">
                      <Icon
                        class="text-cyan-11 h-5 w-5"
                        aria-hidden="true"
                        path={check}
                              />
                    </Select.ItemIndicator>
                  </Select.Item>
                )}
              </For>
            </Select.Listbox>
          </Select.Content>
        </Select.Portal>
      </div>
    </Select.Root>
  )
}

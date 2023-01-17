import {
  HeadlessDisclosureChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from 'solid-headless'
import { Icon } from 'solid-heroicons'
import { check, chevronUpDown } from 'solid-heroicons/outline'
import { createSignal, For, Component } from 'solid-js'

function classNames (...classes: Array<string | boolean | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export interface DropDownProps {
  options: Array<{
    name: string
    value: string
  }>
  value?: string
  onChange?: (value: string) => void
}

export const DropDown: Component<DropDownProps> = (props) => {
  const initialValue = () => {
    return props.options.find((option) => option.value === props.value) ?? props.options[0]
  }
  const [selected, setSelected] = createSignal(initialValue())

  return (
    <Listbox
      defaultOpen={false}
      value={selected()}
      onSelectChange={setSelected}
    >
      <div class="relative mt-1">
        <ListboxButton class="bg-slate-3 relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300/75 sm:text-sm">
          <span class="block truncate">{selected().name}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon
              class="text-slate-11 h-5 w-5"
              aria-hidden="true"
              path={chevronUpDown}
            />
          </span>
        </ListboxButton>
        <HeadlessDisclosureChild>
          {({ isOpen }) => (
            <Transition
              show={isOpen()}
              enter="transition ease-in duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions class="bg-slate-3 ring-slate-7/5 absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 focus:outline-none sm:text-sm">
                <For each={props.options}>
                  {(person) => (
                    <ListboxOption
                      class="group focus:outline-none"
                      value={person}
                    >
                      {({ isActive, isSelected }) => (
                        <div
                          class={classNames(
                            isActive()
                              ? 'text-cyan-12 bg-slate-5'
                              : 'text-slate-11',
                            'group-hover:text-slate-12 group-hover:bg-cyan-5',
                            'cursor-default select-none relative py-2 pl-10 pr-4'
                          )}
                        >
                          <span
                            class={classNames(
                              isSelected() ? 'font-medium' : 'font-normal',
                              'block truncate'
                            )}
                          >
                            {person.name}
                          </span>
                          {isSelected()
                            ? (
                              <span
                                class={classNames(
                                  isActive() ? 'text-cyan-12' : 'text-cyan-12',
                                  'group-hover:text-cyan-11',
                                  'absolute inset-y-0 left-0 flex items-center pl-3'
                                )}
                            >
                                <Icon
                                  class="h-5 w-5"
                                  aria-hidden="true"
                                  path={check}
                              />
                              </span>
                              )
                            : null}
                        </div>
                      )}
                    </ListboxOption>
                  )}
                </For>
              </ListboxOptions>
            </Transition>
          )}
        </HeadlessDisclosureChild>
      </div>
    </Listbox>
  )
}

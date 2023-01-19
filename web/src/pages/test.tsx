import { createSignal, JSX } from 'solid-js'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  DialogOverlay
} from 'solid-headless'

function classNames (...classes: Array<string | boolean | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

const BUTTON = classNames(
  'rounded-md px-4 py-2 text-sm font-medium transition duration-150',
  'focus:outline-none focus-visible:ring focus-visible:ring-opacity-75',
  'focus-visible:ring-gray-900',
  'dark:focus-visible:ring-gray-50',
  'border-2 border-gray-900 dark:border-gray-50',
  // Background
  'bg-gray-900 hover:bg-gray-700 active:bg-gray-800',
  // Foreground
  'text-gray-50 hover:text-gray-200 active:text-gray-100'
)

export function DialogPreview (): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(false)

  function closeModal () {
    setIsOpen(false)
  }

  function openModal () {
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        class={BUTTON}
      >
        Open dialog
      </button>

      <Transition
        appear
        show={isOpen()}
      >
        <Dialog
          isOpen
          class="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div class="flex min-h-screen items-center justify-center px-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogOverlay class="fixed inset-0 bg-gray-900 bg-opacity-50" />
            </TransitionChild>
            {/* <DialogOverlay class="fixed inset-0 z-0 bg-gray-900 bg-opacity-50" /> */}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              class="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <DialogPanel class="z-10 my-8 inline-block w-full max-w-md overflow-hidden rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all dark:border dark:border-gray-50 dark:bg-gray-900">
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-50"
                >
                Payment successful
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-900 dark:text-gray-50">
                  Your payment has been successfully submitted. We’ve sent
                  your an email with all of the details of your order.
                </p>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class={BUTTON}
                  onClick={closeModal}
                  >
                  Got it, thanks!
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

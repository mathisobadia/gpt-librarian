import { Button } from '../base-ui/button'
import { Component, createSignal } from 'solid-js'
import { Dialog, DialogOverlay, DialogPanel, DialogTitle, Transition, TransitionChild } from 'solid-headless'
import { useParams } from '@solidjs/router'
import { NotionLogo } from '../base-ui/notion-logo'
import { GithubLogo } from '../base-ui/github-logo'

export const CreateConnection: Component = () => {
  const params = useParams()
  const workspaceId = params.workspaceId

  const [isOpen, setIsOpen] = createSignal(false)

  const closeModal = () => {
    setIsOpen(false)
  }

  const openModal = () => {
    setIsOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        intent="primary"
      >
        Add Connection
      </Button>

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
              <DialogOverlay class="bg-whiteA-9 dark:bg-blackA-9 fixed inset-0 z-0" />
            </TransitionChild>
            <span
              class="inline-block h-screen align-middle"
              aria-hidden="true"
              >
              &#8203;
            </span>

            <DialogPanel class="bg-slate-4 z-10 my-8 inline-block w-full max-w-md overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                class="text-slate-12 text-lg font-medium leading-6"
                  >
                Add Connection
              </DialogTitle>
              <ChooseConnectionType workspaceId={workspaceId}/>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

const ChooseConnectionType: Component<{ workspaceId: string }> = (props) => {
  return (
    <div class="flex flex-col space-y-4 pt-5">
      <p class='text-slate-11'>Choose Connection type</p>
      <Button
        href={`https://api.notion.com/v1/oauth/authorize?client_id=f04ba64b-0106-4612-81e0-d67f9d456148&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fapp.gpt-librarian.com%2Fnotion-oauth&state=${props.workspaceId}`}
        type="button"
        intent="secondary"
        >
        <NotionLogo class='inline'/> <span>Notion</span>
      </Button>
      <Button
        disabled
        type="button"
        intent="secondary"
        >
        <GithubLogo class='inline'/> <span>Github (coming soon)</span>
      </Button>
    </div>
  )
}

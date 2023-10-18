import { Button, button } from '../base-ui/button'
import { type Component } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { useParams } from '@solidjs/router'
import { NotionLogo } from '../base-ui/notion-logo'
import { GithubLogo } from '../base-ui/github-logo'
import { Icon } from 'solid-heroicons'
import { squaresPlus, xMark } from 'solid-heroicons/outline'

export const CreateConnection: Component = () => {
  const params = useParams()
  const workspaceId = params.workspaceId

  return (
    <Dialog.Root>
      <Dialog.Trigger class={button({
        intent: 'primary'
      })}>
        <Icon class='inline h-8 w-8' path={squaresPlus}/><span> Add Connection</span>
      </Dialog.Trigger>
      <Dialog.Portal
          >
        <Dialog.Overlay class="bg-whiteA-9 dark:bg-blackA-9 fixed inset-0 z-0" />
        <div class="fixed inset-0 flex min-h-screen items-center justify-center px-4">
          <Dialog.Content class="bg-slate-4 z-10 my-8 inline-block w-full max-w-md overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              class="text-slate-12 text-lg font-medium leading-6"
                  >
              Add Connection
            </Dialog.Title>
            <Dialog.CloseButton>
              <Icon path={xMark} />
            </Dialog.CloseButton>
            <Dialog.Description>
              <ChooseConnectionType workspaceId={workspaceId}/>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
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

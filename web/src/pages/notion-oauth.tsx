import { Navigate, useNavigate, useSearchParams } from '@solidjs/router'
import { For, Match, Switch } from 'solid-js'
import { Button } from '../base-ui/button'
import { Spinner } from '../base-ui/spinner'
import { createConnectionMutation } from '../queries/create-connection'
import { listUserWorkspacesQuery } from '../queries/list-user-workspaces'

export const NotionOauth = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  console.log(params.state)
  // we saved the workspaceId in the state param, if it exists we can use it, otherwise we ask the user to select a workspace
  const workspaceId = params.state
  // secret code to exchange for an access token
  const code = params.code
  console.log(params.code)
  const mutation = createConnectionMutation(() => {
    console.log('connection created')
    // redirect to the workspace page
    navigate(`/workspace/${workspaceId}`)
  })

  const query = listUserWorkspacesQuery(res => {
    const workspace = res.workspaces.find(workspace => workspace.workspaceId === workspaceId)
    if (workspace) {
      connectToWorkspace(workspaceId)
    }
  })

  const connectToWorkspace = (workspaceId: string) => {
    mutation.mutate({
      workspaceId,
      oauthCode: code,
      type: 'NOTION'
    })
  }

  return (
    <Switch>
      <Match when={query.isLoading || mutation.isLoading}>
        <h1 class='text-slate-12' >
          Connecting to Notion...
        </h1>
        <Spinner/>
      </Match>
      <Match when={query.isError}>
        <Navigate href="/sign-up"/>
      </Match>
      <Match when={query.isSuccess && query.data && !workspaceId} >
        <div class="container mx-auto p-5">
          <p class="text-slate-12">TEST: {code} {workspaceId}</p>
          <p class="text-slate-12">Choose which workspace to connect to:</p>
          <div class='flex w-64 flex-col gap-2 p-5'>
            <For each={query.data!.workspaces}>
              {(workspace) => (
                <Button onClick={(event) => { connectToWorkspace(workspace.workspaceId) }}>{workspace.name}</Button>
              )}
            </For>
          </div>
        </div>
      </Match>
    </Switch>
  )
}

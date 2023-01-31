import { ListUserWorkspacesResponse } from '@gpt-librarian/services/functions/workspace/types'
import { A, Navigate, Outlet, useLocation, useNavigate } from '@solidjs/router'
import { Icon } from 'solid-heroicons'
import { chatBubbleLeftRight, documentPlus, magnifyingGlass } from 'solid-heroicons/outline'
import { Component, createSignal, JSXElement, Match, Switch } from 'solid-js'
import { DropDown, DropDownOption } from '../base-ui/dropdown'
import { Spinner } from '../base-ui/spinner'
import { listUserWorkspacesQuery } from '../queries/list-user-workspaces'
import { useSession } from '../queries/query-utils'

export const Workspaces: Component = () => {
  const location = useLocation()
  const { logout } = useSession()
  const onError = () => {
    logout()
    navigate('/')
  }
  const getWorkspaceId = () => {
    const workspaceId = (location.pathname
      .split('workspace/')[1])
      ? location.pathname
        .split('workspace/')[1]?.split('/')[0]
      : undefined
    return workspaceId
  }
  const [selectedWorkspace, setSelectedWorkspace] = createSignal<ListUserWorkspacesResponse['workspaces'][number] | null>(null)
  const navigate = useNavigate()
  // const params = useParams()
  const onSucess = (data: ListUserWorkspacesResponse) => {
    console.log('ON SUCCESS', data)
    if (!getWorkspaceId()) {
      navigate(`/workspace/${data.workspaces[0].workspaceId}`)
      query.refetch().catch((error) => console.error(error))
      return
    }
    const workspace = data.workspaces.find((workspace) => workspace.workspaceId === getWorkspaceId())
    if (workspace) {
      setSelectedWorkspace(workspace)
    } else {
      navigate(`/workspace/${data.workspaces[0].workspaceId}`)
      query.refetch().catch((error) => console.error(error))
    }
  }
  const query = listUserWorkspacesQuery(onSucess, onError)
  const onDropDownChange = (option: DropDownOption) => {
    if (query.data) {
      const newSelectedWorkspace = query.data.workspaces.find((workspace) => workspace.workspaceId === option.value)
      if (newSelectedWorkspace) {
        setSelectedWorkspace(newSelectedWorkspace)
      }
    }
  }

  return (
    <Switch>
      <Match when={query.isLoading}>
        <Spinner/>
      </Match>
      <Match when={query.isError}>
        <Navigate href="/"/>
      </Match>
      <Match when={query.isSuccess && query.data && selectedWorkspace()}>
        <div class="flex min-h-screen flex-row pt-3">
          <aside class="w-64 pr-3" aria-label="Sidebar">
            <div class="bg-slate-3 overflow-y-auto rounded px-3 py-4">
              <DropDown
                onChange={onDropDownChange}
                options={query.data!.workspaces.map((workspace) => ({
                  name: workspace.name ?? 'Untitled',
                  value: workspace.workspaceId
                }))}
            />
              <ul class="space-y-2 pt-3">
                <LeftPanelListElement icon={chatBubbleLeftRight} text="Chat" href={`/workspace/${selectedWorkspace()!.workspaceId}/chat`}/>
                <LeftPanelListElement icon={magnifyingGlass} text="Search" href={`/workspace/${selectedWorkspace()!.workspaceId}/search`}/>
                <LeftPanelListElement icon={documentPlus} text="Connections" href={`/workspace/${selectedWorkspace()!.workspaceId}/connections`}/>
              </ul>
            </div>
          </aside>
          <div class='w-full'>
            <Outlet />
          </div>
        </div>
      </Match>
    </Switch>
  )
}

const LeftPanelListElement: Component<{
  icon: { path: JSXElement }
  text: string
  href: string
}> = (props) => {
  return (
    <li>
      <A
        href={props.href}
        class="text-slate-11 hover:bg-slate-4 hover:text-slate-12 focus-visible:ring-slate-7 flex items-center rounded-lg p-2 text-base font-normal focus:outline-none focus-visible:ring-2"
    >
        <Icon path={props.icon} class="h-8 w-8"/>
        <span class="ml-3 flex-1 whitespace-nowrap">{props.text}</span>
      </A>
    </li>
  )
}

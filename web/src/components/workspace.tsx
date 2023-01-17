import { A, useParams } from '@solidjs/router'

export const Workspace = () => {
  const params = useParams()
  const workspaceId = params.workspaceId
  return (
    <div class="space-x-10">
      <A
        href={`/workspaces/${workspaceId}/chat`}
        class="text-slate-11 hover:text-slate-12 text-base font-medium"
      >
        Chat
      </A>
      <A
        href={`/workspaces/${workspaceId}/connections`}
        class="text-slate-11 hover:text-slate-12 text-base font-medium"
      >
        Connections
      </A>
      <A
        href={`/workspaces/${workspaceId}/embeddings`}
        class="text-slate-11 hover:text-slate-12 text-base font-medium"
      >
        Embeddings
      </A>
    </div>
  )
}

import { A, useParams } from "@solidjs/router";

export const Workspace = () => {
  const params = useParams();
  const workspaceId = params.workspaceId;
  return (
    <div class="space-x-10">
      <A
        href={`/workspaces/${workspaceId}/chat`}
        class="text-base font-medium text-slate-11 hover:text-slate-12"
      >
        Chat
      </A>
      <A
        href={`/workspaces/${workspaceId}/connections`}
        class="text-base font-medium text-slate-11 hover:text-slate-12"
      >
        Connections
      </A>
      <A
        href={`/workspaces/${workspaceId}/embeddings`}
        class="text-base font-medium text-slate-11 hover:text-slate-12"
      >
        Embeddings
      </A>
    </div>
  );
};

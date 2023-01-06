import { A, useParams } from "@solidjs/router";

export const Workspace = () => {
  const params = useParams();
  const workspaceId = params.workspaceId;
  return (
    <nav class="hidden space-x-10 md:flex">
      <A
        href={`/workspaces/${workspaceId}/chat`}
        class="text-base font-medium text-gray-500 hover:text-gray-900"
      >
        Chat
      </A>
      <A
        href={`/workspaces/${workspaceId}/connections`}
        class="text-base font-medium text-gray-500 hover:text-gray-900"
      >
        Connections
      </A>
      <A
        href={`/workspaces/${workspaceId}/embeddings`}
        class="text-base font-medium text-gray-500 hover:text-gray-900"
      >
        Embeddings
      </A>
    </nav>
  );
};

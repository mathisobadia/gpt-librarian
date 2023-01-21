import { Component, createSignal, Match, Switch } from 'solid-js'
import { searchQuery } from '../queries/search'
import { EmbeddingList } from '../components/embedding'
import { useParams, useSearchParams } from '@solidjs/router'
import { Spinner } from '../base-ui/spinner'
import { Input } from '../base-ui/input'
import { magnifyingGlass } from 'solid-heroicons/outline'

export const Search: Component = () => {
  const param = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQueryParam = searchParams.searchquery
  const workspaceId = param.workspaceId
  const [search, setSearch] = createSignal(searchQueryParam)
  const query = searchQuery({ workspaceId, searchQuery: searchQueryParam })
  const onSubmit = (e: Event) => {
    e.preventDefault()
    setSearchParams({ searchquery: search() })
    // reload the page its a hack to get the query to refetch I need to figure out how to do this properly
    setTimeout(() => window.location.reload(), 0)
  }
  return (
    <div class="bg-slate-2">
      <div>
        <form onSubmit={onSubmit}>
          <h1 class="text-slate-11 pb-4 text-2xl font-bold">Search</h1>
          <Input icon={magnifyingGlass} label="search" signal={[search, setSearch]} type="text"/>
        </form>
      </div>

      <div class="flex flex-col items-center justify-center pt-4">
        <Switch>
          <Match when={query.isLoading || query.isFetching}>
            <Spinner/>
          </Match>
          <Match when={query.isError}>
            <p class="text-slate-12">Error: {JSON.stringify(query.error)}</p>
          </Match>
          <Match when={query.isSuccess && query.data}>
            <EmbeddingList embeddings={query.data!} />
          </Match>
        </Switch>
      </div>
    </div>
  )
}

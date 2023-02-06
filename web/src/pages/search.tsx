import { Component, createSignal, Match, Switch } from 'solid-js'
import { searchSolidQuery } from '../queries/search'
import { EmbeddingList } from '../components/embedding'
import { useParams, useSearchParams } from '@solidjs/router'
import { Spinner } from '../base-ui/spinner'
import { InputWithIcon } from '../base-ui/input'
import { magnifyingGlass } from 'solid-heroicons/outline'

export const Search: Component = () => {
  const param = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQueryParam = searchParams.searchquery
  const workspaceId = param.workspaceId
  const [searchQuery, setSearchQuery] = createSignal(searchQueryParam)
  const { solidQuery, setQuery } = searchSolidQuery({ workspaceId, searchQuery: searchQueryParam })
  const onSubmit = (e: Event) => {
    e.preventDefault()
    setSearchParams({ searchquery: searchQuery() })
    setQuery(searchQuery())
  }
  return (
    <div class="bg-slate-2">
      <div>
        <form onSubmit={onSubmit}>
          <h1 class="text-slate-11 pb-4 text-2xl font-bold">Search</h1>
          <InputWithIcon icon={magnifyingGlass} label="search" signal={[searchQuery, setSearchQuery]} type="text" placeholder="enter search query here"/>
        </form>
      </div>

      <div class="flex flex-col items-center justify-center pt-4">
        <Switch>
          <Match when={solidQuery.isLoading || solidQuery.isFetching}>
            <Spinner/>
          </Match>
          <Match when={solidQuery.isError}>
            <p class="text-slate-12">Error: {JSON.stringify(solidQuery.error)}</p>
          </Match>
          <Match when={solidQuery.isSuccess && solidQuery.data}>
            <EmbeddingList embeddings={solidQuery.data!} />
          </Match>
        </Switch>
      </div>
    </div>
  )
}

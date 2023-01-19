import type { Component } from 'solid-js'
import { Chat } from './pages/chat'
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/solid-query'
import { Route, Routes } from '@solidjs/router'
import { Home } from './pages/home'
import { Connections } from './pages/connections'
import { Search } from './pages/search'
import { Header } from './components/header'
import { LogIn } from './pages/log-in'
import { Workspaces } from './layouts/workspaces'
import { Workspace } from './components/workspace'
import { privacyPolicy } from './pages/privacy-policy'
import { SignUp } from './pages/sign-up'
import { DialogPreview } from './pages/test'
import { NotionOauth } from './pages/notion-oauth'

const queryClient = new QueryClient()

const App: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main class="bg-slate-1 pt-20">
        <Routes>
          <Route path="/workspaces" component={Workspaces}>
            <Route path="/" />
            <Route path=":workspaceId">
              <Route path="/" component={Workspace} />
              <Route path="/connections" component={Connections} />
              <Route path="/search" component={Search} />
              <Route path="/chat" component={Chat} />
            </Route>
          </Route>
          <Route path="/" component={Home} />
          <Route path="/log-in" component={LogIn} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/privacy-policy" component={privacyPolicy} />
          <Route path="/test" component={DialogPreview} />
          <Route path="notion-oauth" component={NotionOauth} />
        </Routes>
      </main>
    </QueryClientProvider>
  )
}

export default App

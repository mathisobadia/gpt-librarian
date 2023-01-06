import type { Component } from "solid-js";
import { Chat } from "./pages/chat";
import {
  QueryClient,
  QueryClientProvider,
  createQuery,
} from "@tanstack/solid-query";
import { Route, Routes } from "@solidjs/router";
import { Home } from "./pages/home";
import { Notion } from "./pages/connections";
import { Embeddings } from "./pages/embeddings";
import { Header } from "./components/header";
import { SignIn } from "./pages/sign-in";
import { Workspaces } from "./layouts/workspaces";
import { Workspace } from "./components/workspace";

const queryClient = new QueryClient();

const App: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header></Header>
      <Routes>
        <Route path="/workspaces" component={Workspaces}>
          <Route path="/" />
          <Route path=":workspaceId">
            <Route path="/" component={Workspace} />
            <Route path="/connections" component={Notion} />
            <Route path="/embeddings" component={Embeddings} />
            <Route path="/chat" component={Chat} />
          </Route>
        </Route>
        <Route path="/" component={Home} />
        <Route path="/sign-in" component={SignIn} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;

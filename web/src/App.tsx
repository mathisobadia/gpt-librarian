import type { Component } from "solid-js";
import { Chat } from "./pages/chat";
import {
  QueryClient,
  QueryClientProvider,
  createQuery,
} from "@tanstack/solid-query";
import { Route, Routes } from "@solidjs/router";
import { Home } from "./pages/home";
import { Notion } from "./pages/notion";
import { Embeddings } from "./pages/embeddings";
import { Header } from "./components/header";
import { SignIn } from "./pages/sign-in";
import { SignUp } from "./pages/sign-up";

const queryClient = new QueryClient();

const App: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Header></Header>
      <Routes>
        <Route path="/chat" component={Chat} />
        <Route path="/" component={Home} />
        <Route path="/notion" component={Notion} />
        <Route path="/embeddings" component={Embeddings} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;

import { Accessor, createRenderEffect, Signal } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:model
      formSubmit: Signal<string>;
    }
  }
}

import { A } from "@solidjs/router";
import { Button as Btn } from "solid-headless";
import { Match, ParentComponent, Switch } from "solid-js";
type ButtonProps = {
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
};
export const Button: ParentComponent<ButtonProps> = (props) => {
  const baseClass =
    "bg-sky-4 hover:bg-sky-5 text-sky-12 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-sky-7";
  const fullClass =
    baseClass +
    (props.fullWidth ? "w-full" : "") +
    (props.disabled ? "opacity-50 cursor-not-allowed" : "");
  return (
    <Switch>
      <Match when={props.href}>
        <Switch>
          <Match when={props.disabled}>
            <span class={fullClass}>{props.children}</span>
          </Match>
          <Match when={!props.disabled}>
            <A class={fullClass} href={props.href!}>
              {props.children}
            </A>
          </Match>
        </Switch>
      </Match>
      <Match when={!props.href}>
        <Btn
          class={fullClass}
          disabled={props.disabled}
          type={props.type || "button"}
        >
          {props.children}
        </Btn>
      </Match>
    </Switch>
  );
};

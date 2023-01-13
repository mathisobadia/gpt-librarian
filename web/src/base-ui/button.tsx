import { A } from "@solidjs/router";
import { Button as Btn } from "solid-headless";
import { Match, ParentComponent, Switch } from "solid-js";
type ButtonProps = {
  disabled?: boolean;
  href?: string;
  intent?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  additionalClass?: string;
  onClick?: (e: Event) => void;
};
export const Button: ParentComponent<ButtonProps> = (props) => {
  const { children, additionalClass, disabled, href } = props;
  // TODO replace this spagetthi with CVA (https://www.npmjs.com/package/class-variance-authority)
  const intent = props.intent || "primary";
  const ghostClass =
    "font-sans bg-transparent py-2 px-4 rounded hover:outline hover:outline-sky-7 hover:outline-2 text-slate-11 hover:text-slate-12 focus:outline-none focus:ring-2 focus:ring-slate-7 ";
  const primaryClass =
    "font-sans bg-sky-4 hover:bg-sky-5 text-sky-12 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-sky-7 ";
  const fullClass =
    (intent === "primary" ? primaryClass : ghostClass) +
    additionalClass +
    (disabled ? " opacity-50 cursor-not-allowed" : "");
  return (
    <Switch>
      <Match when={href}>
        <Switch>
          <Match when={disabled}>
            <span class={fullClass}>{children}</span>
          </Match>
          <Match when={!disabled}>
            <A class={fullClass} href={href!}>
              {children}
            </A>
          </Match>
        </Switch>
      </Match>
      <Match when={!href}>
        <Btn
          onClick={props.onClick}
          class={fullClass}
          disabled={disabled}
          type={props.type || "button"}
        >
          {children}
        </Btn>
      </Match>
    </Switch>
  );
};

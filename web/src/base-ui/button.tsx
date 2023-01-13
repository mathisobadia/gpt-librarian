import { A } from "@solidjs/router";
import { Button as Btn } from "solid-headless";
import { Match, ParentComponent, Switch } from "solid-js";
import { cva } from "class-variance-authority";

type ButtonProps = {
  disabled?: boolean;
  href?: string;
  intent?: "primary" | "ghost";
  type?: "button" | "submit";
  additionalClass?: string;
  size?: "small" | "medium";
  onClick?: (e: Event) => void;
};
export const Button: ParentComponent<ButtonProps> = (props) => {
  const { children, additionalClass, disabled, href, intent, size } = props;

  const button = cva(
    [
      "font-sans",
      "rounded",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed",
      "focus:outline-none",
      "focus:ring-2",
    ],
    {
      variants: {
        intent: {
          primary: [
            "bg-cyan-5",
            "hover:bg-cyan-6",
            "text-cyan-12",
            "font-bold",
            "focus:ring-cyan-7",
          ],
          ghost: [
            "bg-transparent",
            "hover:outline",
            "hover:outline-cyan-7",
            "hover:outline-2",
            "text-slate-11",
            "hover:text-slate-12",
            "focus:ring-slate-7",
          ],
        },
        size: {
          small: ["text-sm", "py-1", "px-2"],
          medium: ["text-base", "py-2", "px-4"],
        },
      },
      defaultVariants: {
        intent: "primary",
        size: "medium",
      },
    }
  );

  const fullClass = button({
    class: additionalClass,
    intent,
    size: size,
  });

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

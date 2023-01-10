import { Component, createUniqueId, Signal } from "solid-js";
type InputProps = {
  signal: Signal<string>;
  label: string;
  type: string;
  name?: string;
};
export const Input: Component<InputProps> = (props) => {
  const { label, type, name } = props;
  const [value, onInput] = props.signal;
  const id = createUniqueId();
  return (
    <>
      <label for={id} class="sr-only">
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        autocomplete={type}
        value={value()}
        onInput={(e) => onInput(e.currentTarget.value)}
        required
        class="bg-slate-2 relative block w-full appearance-none rounded-md border border-slate-6 px-3 py-2 text-slate-12 placeholder-slate-11 focus:ring-2 focus:outline-none focus:ring-sky-7 sm:text-sm"
        placeholder={label}
      ></input>
    </>
  );
};

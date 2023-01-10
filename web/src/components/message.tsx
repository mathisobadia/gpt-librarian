import { ParentComponent } from "solid-js";

export type MessageProps = {
  message: string;
  type: "user" | "bot";
};

export const ChatMessage: ParentComponent<MessageProps> = (props) => {
  const { message, type } = props;
  return (
    <div class="w-full border-b border-black/10 text-slate-11 group">
      <div class="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0">
        <div class="w-[30px] flex flex-col relative items-end">
          <div class="bg-[#5436DA] rounded-sm text-slate-12 flex justify-center items-center relative tracking-widest h-8 w-8 text-xs">
            <svg
              stroke="currentColor"
              fill="none"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-6 w-6"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
        <div class="relative flex w-[calc(100%-50px)] md:flex-col lg:w-[calc(100%-115px)]">
          <div class="flex flex-grow flex-col gap-3">
            <div class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
              {message}
            </div>
          </div>
          <div class="text-slate-11 flex self-end lg:self-center justify-center mt-2 gap-4 lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible">
            <button class="p-1 rounded-md hover:bg-slate-1 hover:text-slate-7 md:invisible md:group-hover:visible">
              <svg
                stroke="currentColor"
                fill="none"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

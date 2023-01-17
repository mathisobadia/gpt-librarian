import { ParentComponent } from 'solid-js'

export interface MessageProps {
  message: string
  type: 'user' | 'bot'
}

export const ChatMessage: ParentComponent<MessageProps> = (props) => {
  return (
    <div class="text-slate-11 group w-full border-b border-black/10">
      <div class="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div class="relative flex w-[30px] flex-col items-end">
          <div class="text-slate-12 relative flex h-8 w-8 items-center justify-center rounded-sm bg-[#5436DA] text-xs tracking-widest">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div class="relative flex w-[calc(100%-50px)] md:flex-col lg:w-[calc(100%-115px)]">
          <div class="flex grow flex-col gap-3">
            <div class="flex min-h-[20px] flex-col items-start gap-4 whitespace-pre-wrap">
              {props.message}
            </div>
          </div>
          <div class="text-slate-11 visible mt-2 flex justify-center gap-4 self-end lg:absolute lg:top-0 lg:right-0 lg:mt-0 lg:translate-x-full lg:gap-1 lg:self-center lg:pl-2">
            <button class="hover:bg-slate-1 hover:text-slate-7 rounded-md p-1 md:invisible md:group-hover:visible">
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

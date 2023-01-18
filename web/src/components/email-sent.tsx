import { Icon } from 'solid-heroicons'
import { envelope } from 'solid-heroicons/outline'

export const EmailSent = () => {
  return (
    <div class="bg-slate-3 rounded-md p-4">
      <div class="flex">
        <div class="shrink-0">
          <div class="text-slate-11 h-8 w-8">
            <Icon path={envelope} class="h-8 w-8"/>
          </div>
        </div>
        <div class="ml-3">
          <h3 class="text-slate-12 text-sm font-medium">Email sent!</h3>
          <div class="text-slate-11 mt-2 text-sm">
            <p>
              We've sent you an email with a link to sign in. If you
              don't see it, check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

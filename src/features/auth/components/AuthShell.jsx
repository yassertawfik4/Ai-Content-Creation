import brandMark from '@/assets/auth/brand-mark.svg'
import { RegisterShowcasePanel } from './RegisterShowcasePanel'

export function AuthShell({ children }) {
  return (
    <main className="flex min-h-dvh w-full bg-[#fef7ff] text-[#1d1b20] xl:h-dvh xl:overflow-hidden">
      <section className="flex w-full shrink-0 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 xl:h-dvh xl:w-[46%] xl:overflow-y-auto xl:px-10 xl:py-8 2xl:w-[812px]">
        <div className="mx-auto flex w-full max-w-[452px] flex-col gap-7 sm:gap-8 xl:gap-9">
          <header className="flex flex-col gap-1">
            <div className="flex items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4f378a] shadow-lg shadow-black/10">
                <img src={brandMark} alt="" className="size-[19px]" />
              </span>
              <span className="pl-2 text-[22px] font-medium leading-7">Sada</span>
            </div>
          </header>
          {children}
        </div>
      </section>
      <RegisterShowcasePanel />
    </main>
  )
}

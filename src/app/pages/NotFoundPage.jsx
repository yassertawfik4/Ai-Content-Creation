import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fef7ff] px-5 text-[#201a25]">
      <section className="w-full max-w-lg rounded-[28px] border border-[#e2d9e6] bg-[#fffaff] p-8 text-center shadow-[0_24px_70px_rgba(46,32,51,0.1)]">
        <SearchX className="mx-auto size-10 text-[#4f378a]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#79688b]">404 · Page not found</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.7px]">That page does not exist</h1>
        <p className="mt-3 text-sm leading-6 text-[#6a6170]">The link may be old, or the address may have been typed incorrectly.</p>
        <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#381e72] px-5 text-sm font-semibold text-white">
          <ArrowLeft className="size-4" /> Back home
        </Link>
      </section>
    </main>
  )
}

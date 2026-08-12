import { Component } from 'react'
import { CircleAlert, Home, RefreshCw } from 'lucide-react'

export class AppErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, details) {
    if (import.meta.env.DEV) console.error('Uncaught application error', error, details)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#fef7ff] px-5 text-[#201a25]">
        <section className="w-full max-w-lg rounded-[28px] border border-[#e2d9e6] bg-[#fffaff] p-7 text-center shadow-[0_24px_70px_rgba(46,32,51,0.12)] sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#fbe9ee] text-[#9f2949]">
            <CircleAlert className="size-7" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.7px]">This page hit an unexpected error</h1>
          <p className="mt-3 text-sm leading-6 text-[#6a6170]">
            Your saved work is still safe. Reload the page, or return home and try again.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#381e72] px-5 text-sm font-semibold text-white"
            >
              <RefreshCw className="size-4" /> Reload page
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d8cfdc] bg-white px-5 text-sm font-semibold text-[#4f378a]"
            >
              <Home className="size-4" /> Return home
            </a>
          </div>
        </section>
      </main>
    )
  }
}

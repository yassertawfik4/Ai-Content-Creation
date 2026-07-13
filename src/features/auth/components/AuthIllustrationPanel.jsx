import { Zap, Users } from 'lucide-react'
import authIllustration from '@/assets/auth-illustration.png'

export function AuthIllustrationPanel() {
  return (
    <div className="relative hidden min-w-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f1edec] via-[#eef0f4] to-[#e3e7ee] lg:flex">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 size-[560px] rounded-full bg-black/10 blur-[90px]" />
        <div className="absolute -bottom-32 -left-16 size-[440px] rounded-full bg-[#c7d2e8]/70 blur-[80px]" />
        <div className="absolute top-1/4 right-1/3 size-[280px] rounded-full bg-white/50 blur-[70px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex w-full max-w-[672px] items-center justify-center">
        <img
          src={authIllustration}
          alt="AI Content Workspace abstract illustration"
          className="w-full scale-110 object-contain drop-shadow-2xl [animation:float_7s_ease-in-out_infinite]"
        />

        <div
          className="absolute left-8 top-16 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/25 p-4 shadow-xl backdrop-blur-md [animation:float_8s_ease-in-out_infinite]"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
            <Users className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold whitespace-nowrap text-foreground">
              10,000+ teams
            </span>
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              creating with AI daily
            </span>
          </div>
        </div>

        <div
          className="absolute bottom-12 right-12 flex max-w-[330px] flex-col gap-2 rounded-2xl border border-white/40 bg-white/25 p-[25px] shadow-2xl ring-1 ring-black/5 backdrop-blur-xl [animation:float_9s_ease-in-out_infinite]"
          style={{ animationDelay: '1s' }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/60" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
            <Zap className="size-3.5 text-foreground" fill="currentColor" />
            <span className="text-xs font-semibold tracking-[0.6px] text-foreground">
              LATEST GENERATION
            </span>
          </div>
          <p className="text-sm font-medium text-[#1c1b1b]">
            "Write a 500-word blog post about the future of AI workflows in
            enterprise environments..."
          </p>
          <div className="flex gap-1 pt-2">
            <div className="h-1.5 w-12 rounded-full bg-black" />
            <div className="h-1.5 w-4 rounded-full bg-black/20" />
            <div className="h-1.5 w-4 animate-pulse rounded-full bg-black/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

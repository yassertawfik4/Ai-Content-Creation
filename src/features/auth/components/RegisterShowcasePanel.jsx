import agentNetwork from '@/assets/auth/agent-network.svg'
import coreMark from '@/assets/auth/core-mark.svg'
import { BarChart3, Lightbulb, Megaphone, Search, ShieldCheck, Sparkles, Workflow } from 'lucide-react'

const agents = [
  {
    label: 'Researcher',
    icon: Search,
    className: 'left-1/2 top-[-37px] -translate-x-1/2',
  },
  {
    label: 'Creator',
    icon: Sparkles,
    className: 'right-[-66px] top-1/4',
  },
  {
    label: 'Orchestrator',
    icon: Workflow,
    className: 'right-[-85px] top-[60.2%]',
  },
  {
    label: 'Analyst',
    icon: BarChart3,
    className: 'bottom-[-37px] left-1/2 -translate-x-1/2',
  },
  {
    label: 'Promoter',
    icon: Megaphone,
    className: 'left-[-73px] top-[60.2%]',
  },
  {
    label: 'Strategist',
    icon: Lightbulb,
    className: 'left-[-74px] top-1/4',
  },
]

function AgentPill({ label, icon: Icon, className, delay }) {
  return (
    <div className={`absolute z-10 ${className}`}>
      <div
        className="auth-agent-pill flex h-[66px] items-center gap-3 rounded-full border p-[17px] text-base font-semibold backdrop-blur-md"
        style={{ animationDelay: delay }}
      >
        <span className="auth-agent-icon flex size-8 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
          <Icon className="size-4" strokeWidth={2.25} />
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </div>
  )
}

export function RegisterShowcasePanel() {
  return (
    <section className="auth-showcase-panel relative hidden h-dvh min-w-0 flex-1 items-center justify-center overflow-hidden px-8 py-8 2xl:px-12 2xl:py-10 xl:flex">
      <span className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[#4f378a]/20 blur-3xl" />
      <span className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#381e72]/20 blur-3xl" />

      <div className="auth-showcase-content relative flex w-full max-w-[672px] flex-col items-center">
        <header className="flex flex-col items-center gap-3 pb-8 text-center 2xl:gap-[15px] 2xl:pb-10">
          <h2 className="auth-showcase-title font-display text-[clamp(38px,3.2vw,57px)] font-bold leading-[1.1] tracking-[-0.57px]">
            Meet your new{' '}
            <em className="auth-showcase-emphasis">workforce.</em>
          </h2>
          <p className="auth-showcase-copy max-w-[560px] text-base leading-7 tracking-[0.15px] 2xl:text-lg 2xl:leading-[28.8px]">
            Sada provides a specialized pod of intelligent agents designed to scale your marketing from insight to execution.
          </p>
        </header>

        <div className="relative flex size-[500px] shrink-0 items-center justify-center">
          <span
            className="auth-network-lines auth-network-lines-mask absolute inset-0 size-full"
            style={{ WebkitMaskImage: `url("${agentNetwork}")`, maskImage: `url("${agentNetwork}")` }}
            aria-hidden="true"
          />
          <span className="auth-orbit auth-orbit-outer absolute inset-0 rounded-full" />
          <span className="auth-orbit auth-orbit-middle absolute inset-[50px] rounded-full" />
          <span className="auth-orbit auth-orbit-inner absolute inset-[100px] rounded-full" />
          <span className="auth-orbit-runner absolute inset-0 rounded-full" />

          {agents.map((agent, index) => (
            <AgentPill
              key={agent.label}
              {...agent}
              delay={`${index * 0.32}s`}
            />
          ))}

          <div className="auth-core-card relative z-10 flex size-48 flex-col items-center justify-center rounded-[32px] border p-8 text-center backdrop-blur-md">
            <div className="mb-2 flex h-[43px] w-12 items-center justify-center rounded-full bg-white/10">
              <img src={coreMark} alt="" className="size-[24px]" />
            </div>
            <p className="auth-core-title text-xl font-semibold leading-7">
              Sada
            </p>
            <p className="auth-core-copy pt-1 text-[10px] font-medium leading-[15px] tracking-[1px]">
              CENTRAL CORE
            </p>
          </div>
        </div>

        <div className="pt-10 2xl:pt-12">
          <div className="auth-control-badge flex items-center overflow-hidden rounded-full border px-6 py-3 text-sm leading-5 backdrop-blur-md">
            <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
            <span className="pl-3 whitespace-nowrap">
              One prompt, everything. You&apos;re always in control.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

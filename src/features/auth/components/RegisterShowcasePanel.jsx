import agentNetwork from '@/assets/auth/agent-network.svg'
import analystIcon from '@/assets/auth/analyst.svg'
import coreMark from '@/assets/auth/core-mark.svg'
import creatorIcon from '@/assets/auth/creator.svg'
import orchestratorIcon from '@/assets/auth/orchestrator.svg'
import promoterIcon from '@/assets/auth/promoter.svg'
import researcherIcon from '@/assets/auth/researcher.svg'
import shieldIcon from '@/assets/auth/shield.svg'
import strategistIcon from '@/assets/auth/strategist.svg'

const agents = [
  {
    label: 'Researcher',
    icon: researcherIcon,
    className: 'left-1/2 top-[-37px] -translate-x-1/2',
  },
  {
    label: 'Creator',
    icon: creatorIcon,
    className: 'right-[-66px] top-1/4',
  },
  {
    label: 'Orchestrator',
    icon: orchestratorIcon,
    className: 'right-[-85px] top-[60.2%]',
  },
  {
    label: 'Analyst',
    icon: analystIcon,
    className: 'bottom-[-37px] left-1/2 -translate-x-1/2',
  },
  {
    label: 'Promoter',
    icon: promoterIcon,
    className: 'left-[-73px] top-[60.2%]',
  },
  {
    label: 'Strategist',
    icon: strategistIcon,
    className: 'left-[-74px] top-1/4',
  },
]

function AgentPill({ label, icon, className, delay }) {
  return (
    <div className={`absolute z-10 ${className}`}>
      <div
        className="auth-agent-pill flex h-[66px] items-center gap-3 rounded-full border border-[#381e72] bg-white/40 p-[17px] text-base font-semibold text-white backdrop-blur-md"
        style={{ animationDelay: delay }}
      >
        <img src={icon} alt="" className="h-8 w-[29px] shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
      </div>
    </div>
  )
}

export function RegisterShowcasePanel() {
  return (
    <section className="relative hidden h-dvh min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#22005c] px-8 py-8 2xl:px-12 2xl:py-10 xl:flex">
      <span className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[#4f378a]/20 blur-3xl" />
      <span className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#381e72]/20 blur-3xl" />

      <div className="auth-showcase-content relative flex w-full max-w-[672px] flex-col items-center">
        <header className="flex flex-col items-center gap-3 pb-8 text-center 2xl:gap-[15px] 2xl:pb-10">
          <h2 className="font-display text-[clamp(38px,3.2vw,57px)] font-bold leading-[1.1] tracking-[-0.57px] text-[#e9ddff]">
            Meet your new{' '}
            <em className="text-[#a38ae3]">workforce.</em>
          </h2>
          <p className="max-w-[560px] text-base leading-7 tracking-[0.15px] text-[#d0bcff] 2xl:text-lg 2xl:leading-[28.8px]">
            AetherFlow AI provides a specialized pod of intelligent agents designed to scale your marketing from insight to execution.
          </p>
        </header>

        <div className="relative flex size-[500px] shrink-0 items-center justify-center">
          <img
            src={agentNetwork}
            alt=""
            className="auth-network-lines absolute inset-0 size-full"
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

          <div className="auth-core-card relative z-10 flex size-48 flex-col items-center justify-center rounded-[32px] border border-white/20 bg-[#4f378a] p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-md">
            <div className="mb-2 flex h-[43px] w-12 items-center justify-center rounded-full bg-white/10">
              <img src={coreMark} alt="" className="size-[24px]" />
            </div>
            <p className="text-xl font-semibold leading-7 text-white">
              AetherFlow
              <br />
              AI
            </p>
            <p className="pt-1 text-[10px] font-medium leading-[15px] tracking-[1px] text-[#d0bcff]">
              CENTRAL CORE
            </p>
          </div>
        </div>

        <div className="pt-10 2xl:pt-12">
          <div className="auth-control-badge flex items-center overflow-hidden rounded-full border border-[#381e72]/50 bg-white/40 px-6 py-3 text-sm leading-5 text-[#e9ddff] backdrop-blur-md">
            <img src={shieldIcon} alt="" className="h-5 w-4 shrink-0" />
            <span className="pl-3 whitespace-nowrap">
              One prompt, everything. You&apos;re always in control.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { ArrowRight, Check, Search, PenTool, CalendarClock } from 'lucide-react'
import { AnimatedText } from './AnimatedText'

const agents = [
  {
    name: 'The Researcher',
    badge: 'RESEARCHER',
    badgeClass: 'bg-[#e8def9] text-[#686177]',
    description:
      'Scours the web for trends, competitor data, and high-intent keywords to fuel your strategy with real-time intelligence.',
    features: ['Trend mapping', 'Competitor analysis'],
    icon: Search,
    preview: (
      <div className="flex size-full flex-col gap-3 bg-gradient-to-br from-[#f8f2f9] to-[#e8def9] p-6">
        <div className="mt-8 flex items-end gap-2">
          {[40, 70, 55, 90, 65, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[#381e72]/70"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <div className="h-2 w-3/4 rounded-full bg-[#381e72]/20" />
        <div className="h-2 w-1/2 rounded-full bg-[#381e72]/15" />
      </div>
    ),
  },
  {
    name: 'The Creator',
    badge: 'CREATOR',
    badgeClass: 'bg-[#4f378a] text-[#c0a7ff]',
    description:
      "Generates high-fidelity posts and professional images tailored to each platform's unique voice and formatting requirements.",
    features: ['Multi-format copy', 'Visual asset gen'],
    icon: PenTool,
    preview: (
      <div className="flex size-full flex-col gap-3 bg-gradient-to-br from-[#ede7fb] to-[#c0a7ff]/40 p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#4f378a]/30" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-full rounded-full bg-[#4f378a]/25" />
            <div className="h-2.5 w-2/3 rounded-full bg-[#4f378a]/20" />
          </div>
        </div>
        <div className="mt-2 flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-[#4f378a]/30 bg-white/40">
          <PenTool className="size-6 text-[#4f378a]/60" />
        </div>
      </div>
    ),
  },
  {
    name: 'The Orchestrator',
    badge: 'ORCHESTRATOR',
    badgeClass: 'bg-[#633b48] text-[#dca7b7]',
    description:
      'Intelligently schedules and publishes content to FB, IG, and LI at the optimal engagement times for your specific audience.',
    features: ['Auto-publishing', 'Engagement analytics'],
    icon: CalendarClock,
    preview: (
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-[#1d1b20] p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#381e72]/40 to-transparent" />
        <svg viewBox="0 0 240 160" className="relative size-full">
          <g stroke="#c0a7ff" strokeWidth="1" fill="none" opacity="0.6">
            <path d="M120 80 L60 45 M120 80 L180 40 M120 80 L80 130 M120 80 L165 125" />
          </g>
          {[
            [120, 80],
            [60, 45],
            [180, 40],
            [80, 130],
            [165, 125],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === 0 ? 6 : 4}
              fill="#c0a7ff"
            />
          ))}
        </svg>
      </div>
    ),
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
  }),
}

export function MarketingTeamSection() {
  return (
    <section id="workspace" className="bg-[#f8f2f9] px-6 py-32 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-[672px]">
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#381e72]">
              <AnimatedText text="The Workspace" stagger={0.045} />
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[#1d1b20] lg:text-5xl">
              <AnimatedText
                text="Meet Your New Marketing Team"
                delay={0.12}
                stagger={0.032}
              />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#494551]">
              <AnimatedText
                text="Three specialized agents, one seamless workflow. Sada brings high-intelligence automation to every stage of your campaign lifecycle."
                delay={0.28}
                stagger={0.012}
              />
            </p>
          </div>
          <a
            href="#platform"
            className="group inline-flex shrink-0 items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-[#381e72] transition-colors hover:bg-[#e8def9]"
          >
            Explore the platform
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {agents.map((agent, i) => {
            const Icon = agent.icon
            return (
              <motion.article
                key={agent.name}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col rounded-[48px] border border-[#cbc4d2] bg-white p-6"
              >
                {/* Preview */}
                <div className="relative h-[250px] overflow-hidden rounded-[32px] border border-[#cbc4d2]">
                  {agent.preview}
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium tracking-wide ${agent.badgeClass}`}
                  >
                    {agent.badge}
                  </span>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col px-2 pt-8">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#e8def9] text-[#4f378a]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-2xl font-semibold text-[#1d1b20]">
                      {agent.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#494551]">
                    {agent.description}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {agent.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-[#494551]"
                      >
                        <Check className="size-4 shrink-0 text-[#4f378a]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

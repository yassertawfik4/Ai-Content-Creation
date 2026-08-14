import { motion } from 'framer-motion'
import { ShieldCheck, LayoutDashboard } from 'lucide-react'
import { AnimatedText } from './AnimatedText'

const stats = [
  { value: '11x', label: 'Production Speed', valueClass: 'impact-stat-primary' },
  { value: '4x', label: 'Engagement Rate', valueClass: 'impact-stat-secondary' },
]

export function ImpactBentoSection() {
  return (
    <section className="impact-section px-6 py-32 lg:px-8">
      <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-3 lg:grid-rows-2">
        {/* Main impact card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="impact-main-card relative flex flex-col justify-end overflow-hidden rounded-[48px] p-12 lg:col-span-2 lg:row-span-2"
        >
          {/* Decorative glow */}
          <div className="impact-main-glow pointer-events-none absolute -right-16 -top-16 size-80 rounded-full blur-3xl" />
          <div className="relative flex flex-col gap-8">
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#f5eff6] sm:text-5xl lg:text-[64px]">
              <AnimatedText
                text={'Orchestrate at scale.\nMeasure the impact.'}
                delay={0.38}
                stagger={0.032}
              />
            </h2>
            <p className="max-w-[512px] text-base leading-relaxed text-[#f5eff6]/80">
              <AnimatedText
                text="Sada doesn't just create content; it builds connected pipelines that turn your marketing strategy into an automated engine of growth."
                delay={0.62}
                stagger={0.012}
              />
            </p>
            <div className="flex gap-16 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-2">
                  <span className={`text-5xl font-bold ${stat.valueClass}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[#f5eff6]/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Small bento: Control */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          className="impact-control-card flex flex-col justify-between gap-10 rounded-[48px] border p-10"
        >
          <div className="flex items-start justify-between">
            <span className="impact-control-icon flex size-16 items-center justify-center rounded-[32px]">
              <ShieldCheck className="size-7" />
            </span>
            <span className="text-xs uppercase tracking-wider text-[#494551]">
              Control
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-[#1d1b20]">
              Creative Control
            </h3>
            <p className="text-sm leading-relaxed text-[#494551]">
              Every output is anchored in your brand voice and needs human
              approval before hitting 'publish'.
            </p>
          </div>
        </motion.div>

        {/* Small bento: Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
          className="impact-results-card flex flex-col justify-between gap-10 rounded-[48px] border p-10"
        >
          <div className="flex items-start justify-between">
            <span className="impact-results-icon flex size-16 items-center justify-center rounded-[32px]">
              <LayoutDashboard className="size-7" />
            </span>
            <span className="impact-results-copy text-xs uppercase tracking-wider">
              Results
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="impact-results-title text-2xl font-semibold">
              Unified View
            </h3>
            <p className="impact-results-copy text-sm leading-relaxed">
              Track performance across all social platforms from a single,
              AI-powered dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

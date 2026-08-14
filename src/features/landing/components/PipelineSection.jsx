import { motion } from 'framer-motion'
import { Database, ImagePlus, Send, Check } from 'lucide-react'
import { AnimatedText } from './AnimatedText'

const steps = [
  {
    badge: '01 DATA INTAKE',
    icon: Database,
    title: 'Strategic Foundation',
    description:
      'Researcher Agent identifies high-intent topics based on your brand goals.',
    preview: (
      <div className="pipeline-preview flex h-[192px] flex-col justify-center gap-4 rounded-[32px] border p-6">
        <div className="pipeline-progress-track h-3 w-full overflow-hidden rounded-full">
          <div className="pipeline-progress-fill h-full w-[70%] rounded-full" />
        </div>
        <p className="text-xs font-medium uppercase tracking-tight text-[#494551]">
          Ingesting keyword data...
        </p>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="pipeline-data-chip h-10 flex-1 rounded-2xl"
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: '02 GENERATION',
    icon: ImagePlus,
    title: 'Multi-Platform Assets',
    description:
      'Creator Agent produces high-quality copy and images for LI, IG, and FB.',
    preview: (
      <div className="pipeline-preview flex h-[192px] flex-col justify-center gap-4 rounded-[32px] border p-6">
        <div className="flex items-center gap-4">
          <div className="pipeline-avatar size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="pipeline-placeholder h-2.5 w-full rounded-full" />
            <div className="pipeline-placeholder-muted h-2.5 w-2/3 rounded-full" />
          </div>
        </div>
        <div className="pipeline-dropzone flex h-20 items-center justify-center rounded-[32px] border-2 border-dashed">
          <ImagePlus className="size-6" />
        </div>
      </div>
    ),
  },
  {
    badge: '03 FINAL POLISH',
    icon: Send,
    title: 'Orchestrated Deployment',
    description:
      'Orchestrator schedules everything for maximum impact and reach.',
    preview: (
      <div className="pipeline-preview flex h-[192px] flex-col justify-center gap-4 rounded-[32px] border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="pipeline-ready-icon flex size-8 items-center justify-center rounded-full">
              <Check className="size-4" />
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-[#1d1b20]">
              Ready to post
            </span>
          </div>
          <Send className="pipeline-accent-icon size-5" />
        </div>
        <div className="pipeline-publish-preview space-y-3 rounded-[32px] border p-4">
          <div className="pipeline-publish-line h-2.5 w-full rounded-full" />
          <div className="pipeline-publish-line h-2.5 w-2/5 rounded-full" />
        </div>
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

export function PipelineSection() {
  return (
    <section id="pipeline" className="pipeline-section px-6 py-32 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#1d1b20] lg:text-5xl">
            <AnimatedText
              text="Your Campaign Pipeline, Automated."
              stagger={0.032}
            />
          </h2>
          <p className="max-w-[672px] text-base text-[#494551]">
            <AnimatedText
              text="From raw data to polished posts in seconds. See how our agents work in harmony."
              delay={0.25}
              stagger={0.014}
            />
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.article
                key={step.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="pipeline-card flex flex-col gap-4 rounded-[48px] border p-8 lg:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="pipeline-step-badge rounded-full px-4 py-1 text-xs font-medium uppercase tracking-wide">
                    {step.badge}
                  </span>
                  <Icon className="pipeline-accent-icon size-5" />
                </div>
                {step.preview}
                <h3 className="pt-2 text-xl font-semibold text-[#1d1b20]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#494551]">
                  {step.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

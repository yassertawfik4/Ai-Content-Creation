import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, Zap, Lightbulb, Globe } from 'lucide-react'

const stats = [
  { icon: Clock, label: 'Time Saved', value: 80, suffix: '%' },
  { icon: Zap, label: 'Content Generated', value: 500, suffix: 'K+' },
  { icon: Lightbulb, label: 'Active Users', value: 10, suffix: 'K+' },
  { icon: Globe, label: 'Platforms Supported', value: 8, suffix: '+' },
]

const reasons = [
  {
    title: 'Save Hours Every Day',
    description:
      'Let AI handle the heavy lifting. Generate content in seconds, not hours.',
    icon: Clock,
  },
  {
    title: 'Professional Quality',
    description:
      'Get on-brand, polished content that rivals top agencies — without the price tag.',
    icon: Zap,
  },
  {
    title: 'Creative Ideas On Tap',
    description:
      'Never run out of inspiration. AI suggests angles, topics, and formats you haven\'t thought of.',
    icon: Lightbulb,
  },
  {
    title: 'Multi-Platform Ready',
    description:
      'Create once and publish everywhere. Optimized formats for every social network.',
    icon: Globe,
  },
]

function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime
    const duration = 2000
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export function WhyChooseSection() {
  return (
    <section id="why-us" className="relative bg-[#f5f4f0] py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 size-[500px] -translate-y-1/2 rounded-full bg-[#81d4ba]/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-sm font-semibold tracking-[0.2em] text-[#ff6719] uppercase">
            Why Content King
          </h2>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for{' '}
            <span className="text-[#ff6719]">Creators</span>
            , by Creators
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Thousands of teams trust Content King to deliver quality content at
            scale.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-[#ff6719] shadow-sm">
                <stat.icon className="size-5 text-white" />
              </div>
              <p className="text-3xl font-black text-foreground">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-2">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-5 rounded-2xl border border-white bg-white p-6 shadow-sm"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ffd1a8]/30">
                <reason.icon className="size-5 text-[#ff6719]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

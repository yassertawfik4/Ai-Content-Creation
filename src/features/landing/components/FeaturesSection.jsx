import { motion } from 'framer-motion'
import {
  MessageSquare,
  Image,
  Palette,
  Clapperboard,
  Video,
  Megaphone,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Social Media Posts',
    description:
      'Generate engaging posts for any platform in seconds. Tailored tone, hashtags, and formatting included.',
  },
  {
    icon: Image,
    title: 'AI Image Creation',
    description:
      'Create stunning visuals from text prompts. Logos, illustrations, product shots — all AI-generated.',
  },
  {
    icon: Palette,
    title: 'Logo Design',
    description:
      'Design professional logos with intelligent AI. Custom styles, colors, and variations instantly.',
  },
  {
    icon: Clapperboard,
    title: 'Storyboard Creation',
    description:
      'Plan and visualize your video content with AI-generated storyboards and scene suggestions.',
  },
  {
    icon: Video,
    title: 'Video Generation',
    description:
      'Turn scripts into videos with AI. Automated editing, voiceovers, and dynamic scene transitions.',
  },
  {
    icon: Megaphone,
    title: 'Marketing Campaigns',
    description:
      'Launch full campaigns with AI-crafted copy, audience targeting, and multi-channel distribution.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-white py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-[#ffd1a8]/20 blur-[120px]" />
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
            Features
          </h2>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to{' '}
            <span className="text-[#ff6719]">Create</span>
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            From social posts to full marketing campaigns — Content King has the
            AI tools to bring your ideas to life.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative overflow-hidden rounded-2xl border border-[#f5f4f0] bg-white p-6 transition-all hover:border-[#ff6719]/20 hover:shadow-lg hover:shadow-[#ff6719]/5"
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[#ff6719] shadow-sm">
                <feature.icon className="size-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#ff6719] opacity-0 transition-opacity group-hover:opacity-100">
                Learn more
                <span className="inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

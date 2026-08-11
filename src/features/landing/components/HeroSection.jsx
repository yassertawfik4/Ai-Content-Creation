import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HeroBackground } from './HeroBackground'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// Interactive highlight tag: on hover the box straightens & pops, a gloss
// streak sweeps across, and each letter collapses to scale:0 then rebuilds
// in a staggered wave.
const tagVariants = {
  hidden: {
    opacity: 0,
    rotate: -8,
    scale: 0.78,
    y: 30,
  },
  rest: { opacity: 1, rotate: -2, scale: 1, y: 0 },
  show: {
    opacity: 1,
    rotate: -2,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 16,
      delay: 0.22,
      delayChildren: 0.36,
      staggerChildren: 0.045,
    },
  },
  hover: {
    opacity: 1,
    rotate: 0,
    scale: 1.06,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 14,
      staggerChildren: 0.05,
    },
  },
}

const glossVariants = {
  hidden: { x: '-160%' },
  rest: { x: '-160%' },
  show: {
    x: ['-160%', '160%'],
    transition: { duration: 0.8, delay: 0.42, ease: 'easeInOut' },
  },
  hover: {
    x: ['-160%', '160%'],
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
}

const letterVariants = {
  hidden: { opacity: 0, scale: 0.65, rotate: -12, y: 16 },
  rest: { opacity: 1, scale: 1, rotate: 0, y: 0 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 18 },
  },
  hover: {
    opacity: 1,
    scale: [1, 0, 1],
    rotate: [0, 180, 360],
    y: [0, -6, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}

function MarketingTag() {
  const prefersReducedMotion = useReducedMotion()
  const [animationState, setAnimationState] = useState('show')

  return (
    <motion.span
      aria-label="marketing"
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? 'rest' : animationState}
      onHoverStart={() => {
        if (!prefersReducedMotion) setAnimationState('hover')
      }}
      onAnimationComplete={(definition) => {
        if (definition === 'hover') setAnimationState('rest')
      }}
      variants={tagVariants}
      className="hero-marketing-tag relative inline-block cursor-default px-4 py-1"
    >
      {/* Gloss sweep (clipped to the box, painted behind the letters) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.span
          variants={glossVariants}
          className="absolute inset-y-0 -inset-x-8 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </span>

      {'marketing'.split('').map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          variants={letterVariants}
          className="relative inline-block"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

export function HeroSection() {
  return (
    <section
      id="platform"
      className="hero-section-theme relative min-h-[760px] overflow-hidden bg-[#fef7ff] pt-[72px]"
    >
      {/* Full-bleed campaign artwork with a contrast-preserving reading veil. */}
      <HeroBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-[1024px] flex-col items-center px-6 py-24 text-center lg:py-28"
      >
        {/* Badge */}
        <motion.div
          variants={item}
          className="hero-announcement mb-10 inline-flex items-center gap-3 rounded-full border px-4 py-2 shadow-[0_12px_40px_rgba(56,30,114,0.06)] backdrop-blur-md"
        >
          <span className="rounded-full bg-[#381e72] px-3 py-1 text-xs font-medium tracking-wide text-white">
            New
          </span>
          <span className="text-sm text-[#1d1b20]">
            Orchestrate your brand across AI search
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-5xl font-bold leading-[1.05] tracking-tight text-[#1d1b20] sm:text-6xl lg:text-[84px] lg:tracking-[-2.1px]"
        >
          <span>Put AI agents to work for</span>
          <MarketingTag />
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="mt-8 max-w-[768px] text-lg leading-relaxed text-[#494551] sm:text-2xl"
        >
          Deploy a team of specialized AI agents that research, create, and
          optimize your entire marketing funnel with machine precision.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href="#pipeline"
            className="hero-primary-action rounded-md px-12 py-4 text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            Get A Demo
          </a>
          <a
            href="/register"
            className="hero-secondary-action rounded-md border px-12 py-4 text-sm font-semibold shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5"
          >
            Start Free Trial
          </a>
        </motion.div>

        {/* Trust signal */}
        <motion.div
          variants={item}
          className="mt-14 flex flex-col items-center gap-4 opacity-80"
        >
          <div className="flex -space-x-2">
            {[
              'bg-[#381e72]/15',
              'bg-[#625b71]/15',
              'bg-[#492532]/15',
            ].map((bg, i) => (
              <span
                key={i}
                className={`hero-trust-avatar flex size-10 items-center justify-center rounded-full border-2 ${bg} text-xs font-bold`}
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
          <p className="text-xs font-medium tracking-wide text-[#1d1b20]">
            Trusted by 100,000+ global marketing teams
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

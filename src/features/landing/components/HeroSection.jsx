import { motion } from 'framer-motion'
import { ArrowRight, Play, Zap, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '@/assets/hero.png'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f5f4f0]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 size-[800px] rounded-full bg-[#ffd1a8]/40 blur-[150px]" />
        <div className="absolute -bottom-40 left-0 size-[600px] rounded-full bg-[#81d4ba]/30 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 size-[400px] rounded-full bg-[#ff6719]/10 blur-[100px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-12 px-4 py-28 lg:flex-row lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ffd1a8] bg-[#ffd1a8]/20 px-4 py-1.5 text-sm text-[#ff6719]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6719]/40" />
              <span className="relative inline-flex size-2 rounded-full bg-[#ff6719]" />
            </span>
            AI-Powered Content Creation
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-[720px] text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Rule Your Content{' '}
            <span className="bg-gradient-to-r from-[#ff6719] to-[#ff6719]/50 bg-clip-text text-transparent">
              Kingdom
            </span>{' '}
            with AI
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-[540px] text-lg leading-relaxed text-muted-foreground"
          >
            Content King empowers you to create professional social posts,
            stunning visuals, videos, and marketing campaigns — all powered by
            advanced AI. No effort, full impact.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff6719] px-6 text-sm font-semibold text-white shadow-lg shadow-[#ff6719]/30 transition-all hover:bg-[#ff6719]/90 hover:shadow-xl hover:shadow-[#ff6719]/40"
              >
                Start Creating Free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </Link>
            <a href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ff6719]/20 bg-white px-6 text-sm font-semibold text-[#ff6719] transition-all hover:bg-[#ffd1a8]/20 hover:border-[#ff6719]/30"
              >
                <Play className="size-4" />
                Explore Features
              </motion.button>
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#81d4ba] text-[10px] font-bold text-white shadow-lg"
                  style={{ zIndex: 5 - i }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                <span className="font-bold">2,000+</span> creators
              </p>
              <p className="text-xs text-muted-foreground">
                already using Content King
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="relative flex flex-1 items-center justify-center"
        >
          <div className="relative w-full max-w-[560px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffd1a8]/30 via-white to-[#81d4ba]/30" />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative p-4"
            >
              <img
                src={heroImage}
                alt="Content King AI Platform"
                className="w-full rounded-2xl object-cover shadow-2xl ring-1 ring-black/5"
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute -left-4 bottom-16 flex items-center gap-3 rounded-2xl border border-[#ffd1a8]/30 bg-[#fff6edb3] p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ff6719]">
                <Zap className="size-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold whitespace-nowrap text-foreground">
                  Content Ready
                </span>
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  in 3 seconds
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5,
              }}
              className="absolute -bottom-2 -right-2 flex items-center gap-3 rounded-2xl border border-[#81d4ba]/30 bg-[#fff6edb3] p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#81d4ba]">
                <Users className="size-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold whitespace-nowrap text-foreground">
                  Smart Suggestions
                </span>
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  Powered by GPT
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

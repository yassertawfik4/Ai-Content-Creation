import { motion, useReducedMotion } from 'framer-motion'
import heroArtwork from '../../../assets/hero-social-studio.webp'

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-0 isolate overflow-hidden"
      aria-hidden="true"
    >
      {/* The artwork stays deliberately quiet so the message remains primary. */}
      <div className="absolute inset-0 opacity-[0.24] sm:opacity-[0.3] lg:opacity-[0.36]">
        <motion.img
          src={heroArtwork}
          alt=""
          width="1376"
          height="768"
          fetchPriority="high"
          className="hero-artwork h-full w-full max-w-none object-cover object-[54%_center] sm:object-center"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.025 }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: 1,
                  x: ['-0.7%', '0.7%', '-0.7%'],
                  y: ['-0.35%', '0.35%', '-0.35%'],
                  scale: [1.025, 1.055, 1.025],
                }
          }
          transition={{
            opacity: { duration: 0.9, ease: 'easeOut' },
            x: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* A slow spectral current suggests content moving through the network. */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -inset-y-1/4 -left-[45vw] w-[32vw] min-w-72 -rotate-[12deg] bg-[linear-gradient(90deg,transparent,rgba(106,226,238,0.12),rgba(255,255,255,0.72),rgba(224,70,229,0.1),transparent)] blur-2xl"
          initial={{ x: 0, opacity: 0 }}
          animate={{
            x: '190vw',
            opacity: [0, 0.58, 0.58, 0],
          }}
          transition={{
            x: {
              duration: 8.5,
              repeat: Infinity,
              repeatDelay: 6.5,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              duration: 8.5,
              repeat: Infinity,
              repeatDelay: 6.5,
              times: [0, 0.15, 0.78, 1],
              ease: 'easeInOut',
            },
          }}
        />
      )}

      {/* A soft reading veil opens around the copy and dissolves the image edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_62%_at_50%_43%,rgba(254,247,255,0.82)_0%,rgba(254,247,255,0.58)_48%,rgba(254,247,255,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(254,247,255,0.6)_0%,transparent_18%,transparent_72%,#fef7ff_100%)]" />

      {/* Color echoes from the artwork add depth without introducing more detail. */}
      <div className="absolute -left-32 top-[18%] size-80 rounded-full bg-[#65dce8]/10 blur-[90px]" />
      <div className="absolute -right-24 top-[32%] size-96 rounded-full bg-[#dd3ee5]/10 blur-[110px]" />

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#9c84bd]/20 to-transparent" />
    </div>
  )
}

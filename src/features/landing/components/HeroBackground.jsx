import { motion } from 'framer-motion'
import { Search, PenTool, CalendarClock } from 'lucide-react'

// Soft drifting aurora blobs give depth in the brand purples.
const blobs = [
  {
    className: 'left-[-6%] top-[8%] size-[420px] bg-[#4f378a]/20',
    animate: { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] },
    duration: 20,
  },
  {
    className: 'right-[-4%] top-[28%] size-[480px] bg-[#c0a7ff]/25',
    animate: { x: [0, -50, 0], y: [0, 60, 0], scale: [1.1, 1, 1.1] },
    duration: 24,
  },
  {
    className: 'bottom-[-8%] left-[32%] size-[400px] bg-[#eeb8c8]/20',
    animate: { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] },
    duration: 22,
  },
]

// Concentric dashed orbits. The two outer rings carry the three agents of the
// team (Researcher / Creator / Orchestrator); the inner ring stays decorative
// so it never drifts over the body copy.
const orbits = [
  {
    size: 520,
    dir: 1,
    duration: 42,
    agents: [],
  },
  {
    size: 780,
    dir: -1,
    duration: 60,
    agents: [
      { icon: Search, color: '#4f378a', angle: 20 },
      { icon: PenTool, color: '#7a5cff', angle: 200 },
    ],
  },
  {
    size: 1020,
    dir: 1,
    duration: 78,
    agents: [{ icon: CalendarClock, color: '#c0648a', angle: 145 }],
  },
]

// Twinkling particles drifting upward.
const particles = [
  { left: '10%', top: '24%', size: 5, dur: 7, delay: 0 },
  { left: '18%', top: '62%', size: 7, dur: 9, delay: 1.2 },
  { left: '26%', top: '38%', size: 4, dur: 6, delay: 0.5 },
  { left: '34%', top: '78%', size: 6, dur: 8, delay: 2 },
  { left: '44%', top: '16%', size: 5, dur: 7.5, delay: 0.8 },
  { left: '56%', top: '70%', size: 4, dur: 6.5, delay: 1.6 },
  { left: '64%', top: '30%', size: 7, dur: 9.5, delay: 0.3 },
  { left: '72%', top: '58%', size: 5, dur: 7, delay: 2.4 },
  { left: '80%', top: '20%', size: 6, dur: 8.5, delay: 1 },
  { left: '88%', top: '48%', size: 4, dur: 6, delay: 1.9 },
  { left: '48%', top: '86%', size: 5, dur: 8, delay: 0.6 },
  { left: '14%', top: '44%', size: 4, dur: 7, delay: 2.7 },
  { left: '92%', top: '68%', size: 6, dur: 9, delay: 0.9 },
  { left: '38%', top: '54%', size: 4, dur: 6.5, delay: 1.4 },
]

function AgentNode({ agent, orbitSize, counterDir, duration }) {
  const Icon = agent.icon
  const r = orbitSize / 2
  const rad = (agent.angle * Math.PI) / 180
  const x = r + r * Math.cos(rad)
  const y = r + r * Math.sin(rad)
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {/* Counter-rotate so the chip stays upright while it orbits */}
      <motion.span
        className="flex size-11 items-center justify-center rounded-2xl border bg-white/85 shadow-lg backdrop-blur-sm"
        style={{
          color: agent.color,
          borderColor: `${agent.color}55`,
          boxShadow: `0 8px 26px -8px ${agent.color}88`,
        }}
        animate={{
          rotate: 360 * counterDir,
          y: [0, -5, 0],
        }}
        transition={{
          rotate: { duration, repeat: Infinity, ease: 'linear' },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Icon className="size-5" />
      </motion.span>
    </div>
  )
}

export function HeroBackground() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Aurora blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[110px] ${blob.className}`}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Orbiting agents around the brand core */}
      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
        {orbits.map((orbit, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-[#4f378a]/20"
            style={{
              width: orbit.size,
              height: orbit.size,
              marginLeft: -orbit.size / 2,
              marginTop: -orbit.size / 2,
            }}
            animate={{ rotate: 360 * orbit.dir }}
            transition={{
              duration: orbit.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {orbit.agents.map((agent, j) => (
              <AgentNode
                key={j}
                agent={agent}
                orbitSize={orbit.size}
                counterDir={-orbit.dir}
                duration={orbit.duration}
              />
            ))}
          </motion.div>
        ))}
      </div>

      {/* Twinkling particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#4f378a]"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -26, 0], opacity: [0.12, 0.55, 0.12] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Central brand glow */}
      <div className="absolute left-1/2 top-[38%] size-[600px] -translate-x-1/2 rounded-full bg-[#381e72]/[0.05] blur-[80px]" />
    </motion.div>
  )
}

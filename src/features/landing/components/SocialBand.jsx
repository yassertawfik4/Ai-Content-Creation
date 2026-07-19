import { motion } from "framer-motion";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
} from "./BrandIcons";

const platforms = [
  { label: "FACEBOOK", icon: FacebookIcon },
  { label: "INSTAGRAM", icon: InstagramIcon },
  { label: "JASPER AI", jasper: true },
  { label: "LINKEDIN", icon: LinkedinIcon },
  { label: "TIKTOK", icon: TiktokIcon },
];

// Curved paths from the central Jasper node (304,40) out to each platform.
// The coordinate system matches the fixed 608×80 icon band on desktop.
const links = [
  "M304,38 Q176,-30 48,38", // → Facebook
  "M304,38 Q240,-14 176,38", // → Instagram
  "M304,38 Q368,-14 432,38", // → LinkedIn
  "M304,38 Q432,-30 560,38", // → TikTok
];

function PlatformIcon({ platform }) {
  const Icon = platform.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="flex w-24 shrink-0 flex-col items-center gap-3"
    >
      {platform.jasper ? (
        <div className="relative flex size-20 items-center justify-center">
          {/* Pulsing halo */}
          <motion.span
            className="absolute inset-0 rounded-3xl bg-[#4f378a]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          {/* Rotating dashed border ring */}
          <motion.span
            className="absolute -inset-1.5 rounded-[26px] border-2 border-dashed border-[#4f378a]/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative flex size-20 items-center justify-center rounded-3xl bg-[#4f378a] text-3xl font-bold text-white shadow-lg shadow-[#4f378a]/40">
            J
          </div>
        </div>
      ) : (
        <div className="flex size-20 items-center justify-center rounded-3xl border border-[#cbc4d2] bg-white text-[#381e72] shadow-sm">
          <Icon className="size-8" />
        </div>
      )}
      <span className="text-[11px] font-medium tracking-wide text-[#686177]">
        {platform.label}
      </span>
    </motion.div>
  );
}

export function SocialBand({ id }) {
  return (
    <section id={id} className="bg-[#fef7ff] px-6 py-24 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-14">
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#1d1b20] lg:text-4xl">
          Connect your voice everywhere.
        </h2>

        {/* Desktop: connected constellation */}
        <div className="relative mx-auto hidden w-[608px] md:block">
          <svg
            className="pointer-events-none absolute inset-x-0 top-0 h-20 w-full overflow-visible"
            viewBox="0 0 608 80"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <filter
                id="packet-glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="link-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4f378a" />
                <stop offset="100%" stopColor="#c0a7ff" />
              </linearGradient>
            </defs>

            <motion.g
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {links.map((d, i) => (
                <g key={i}>
                  {/* faint static base line */}
                  <path
                    d={d}
                    stroke="#cbc4d2"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  {/* animated flowing dashes */}
                  <motion.path
                    d={d}
                    stroke="url(#link-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 8"
                    animate={{ strokeDashoffset: [0, -56] }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {/* traveling packet emanating from Jasper */}
                  <circle r="3.5" fill="#4f378a" filter="url(#packet-glow)">
                    <animateMotion
                      path={d}
                      dur="2.4s"
                      begin={`${i * 0.5}s`}
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="spline"
                      keySplines="0.4 0 0.2 1"
                    />
                  </circle>
                </g>
              ))}
            </motion.g>
          </svg>

          <div className="relative flex gap-8">
            {platforms.map((platform) => (
              <PlatformIcon key={platform.label} platform={platform} />
            ))}
          </div>
        </div>

        {/* Mobile: simple wrapped grid */}
        <div className="flex flex-wrap justify-center gap-8 md:hidden">
          {platforms.map((platform) => (
            <PlatformIcon key={platform.label} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  );
}

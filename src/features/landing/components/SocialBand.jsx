import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
} from "./BrandIcons";

const OUTER_ORBIT = "clamp(9.1rem, 24vw, 16.875rem)";
const INNER_ORBIT = "clamp(5.75rem, 16vw, 11.25rem)";

const platforms = [
  {
    label: "FACEBOOK",
    icon: FacebookIcon,
    radius: OUTER_ORBIT,
    startAngle: -118,
    direction: 1,
    duration: 30,
  },
  {
    label: "TIKTOK",
    icon: TiktokIcon,
    radius: OUTER_ORBIT,
    startAngle: 2,
    direction: 1,
    duration: 30,
  },
  {
    label: "APPS",
    icon: LayoutGrid,
    radius: OUTER_ORBIT,
    startAngle: 122,
    direction: 1,
    duration: 30,
  },
  {
    label: "LINKEDIN",
    icon: LinkedinIcon,
    radius: INNER_ORBIT,
    startAngle: -50,
    direction: -1,
    duration: 22,
  },
  {
    label: "INSTAGRAM",
    icon: InstagramIcon,
    radius: INNER_ORBIT,
    startAngle: 130,
    direction: -1,
    duration: 22,
  },
];

function PlatformCard({ platform, index, prefersReducedMotion }) {
  const Icon = platform.icon;

  return (
    <motion.div
      className="group flex w-16 flex-col items-center gap-2 md:w-24"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.82 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{
        delay: 0.12 + index * 0.06,
        duration: 0.42,
        ease: "easeOut",
      }}
      whileHover={{ y: -3, scale: 1.04 }}
    >
      <div className="relative flex size-12 items-center justify-center rounded-2xl border border-[#cfc5dc]/70 bg-white/90 text-[#4f378a] shadow-[0_12px_36px_rgba(56,30,114,0.11)] backdrop-blur-md transition-all duration-200 group-hover:border-[#9d82cc]/70 group-hover:shadow-[0_16px_42px_rgba(79,55,138,0.18)] md:size-14">
        <span className="absolute -inset-1.5 -z-10 rounded-[20px] bg-[#b99be8]/10 opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-100" />
        <Icon className="size-5 md:size-6" />
      </div>
      <span className="text-[8px] font-semibold tracking-[0.15em] text-[#686177] md:text-[10px] md:tracking-[0.18em]">
        {platform.label}
      </span>
    </motion.div>
  );
}

function OrbitingPlatform({ platform, index, prefersReducedMotion, isOrbiting }) {
  const endAngle = platform.startAngle + 360 * platform.direction;
  const orbitTransition = {
    duration: platform.duration,
    repeat: Infinity,
    ease: "linear",
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 z-30"
      style={{ "--orbit-radius": platform.radius }}
    >
      <motion.div
        initial={{ rotate: platform.startAngle }}
        animate={{
          rotate:
            prefersReducedMotion || !isOrbiting
              ? platform.startAngle
              : endAngle,
        }}
        transition={isOrbiting ? orbitTransition : { duration: 0 }}
      >
        <div style={{ transform: "translateX(var(--orbit-radius))" }}>
          <motion.div
            initial={{ rotate: -platform.startAngle }}
            animate={{
              rotate:
                prefersReducedMotion || !isOrbiting
                  ? -platform.startAngle
                  : -endAngle,
            }}
            transition={isOrbiting ? orbitTransition : { duration: 0 }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <PlatformCard
                platform={platform}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function JasperHub({ prefersReducedMotion }) {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        className="absolute -inset-8 rounded-full bg-[#7252bd]/20 blur-2xl"
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [0.9, 1.18, 0.9], opacity: [0.28, 0.52, 0.28] }
        }
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute -inset-3 rounded-full border border-dashed border-[#7b5eb5]/45" />

      <motion.div
        initial={
          prefersReducedMotion
            ? false
            : { opacity: 0, scale: 0.76, rotate: -6 }
        }
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ type: "spring", stiffness: 170, damping: 17 }}
        className="relative flex size-24 items-center justify-center rounded-full border border-white/60 bg-gradient-to-br from-[#5f43a4] to-[#381e72] text-4xl font-bold text-white shadow-[0_22px_55px_rgba(56,30,114,0.32)] md:size-28 md:text-5xl"
      >
        <span className="absolute inset-px rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_42%)]" />
        <span className="relative">J</span>
      </motion.div>
    </div>
  );
}

function OrbitTracks() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 size-[clamp(18.2rem,48vw,33.75rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#75d7e2]/40 shadow-[0_0_70px_rgba(111,209,222,0.07)]" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(11.5rem,32vw,22.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#9678c7]/35" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(7.5rem,18vw,12rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8065b6]/10" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(18rem,46vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(114,82,189,0.08)_0%,rgba(114,82,189,0.025)_40%,transparent_72%)]" />
    </div>
  );
}

export function SocialBand({ id }) {
  const orbitRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const isOrbiting = useInView(orbitRef, { amount: 0.15 });

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-[#fef7ff] px-4 py-24 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9c84bd]/20 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-[62%] h-72 w-[80%] -translate-x-1/2 rounded-full bg-[#805ac7]/[0.06] blur-[100px]" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-20 text-center"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#70579e]">
            One voice. Every channel.
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1d1b20] sm:text-4xl lg:text-5xl">
            Connect your voice everywhere.
          </h2>
        </motion.div>

        <div
          ref={orbitRef}
          className="relative mt-6 h-[390px] w-full max-w-[1100px] sm:h-[520px] lg:mt-2 lg:h-[620px]"
        >
          <OrbitTracks />

          {platforms.map((platform, index) => (
            <OrbitingPlatform
              key={platform.label}
              platform={platform}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
              isOrbiting={isOrbiting}
            />
          ))}

          <JasperHub prefersReducedMotion={prefersReducedMotion} />
        </div>
      </div>
    </section>
  );
}

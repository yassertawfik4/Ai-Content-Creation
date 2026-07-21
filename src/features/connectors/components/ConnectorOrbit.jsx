import { motion, useReducedMotion } from "framer-motion";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "../../landing/components/BrandIcons";

const orbitingConnectors = [
  { name: "Facebook", icon: FacebookIcon, angle: -90 },
  { name: "LinkedIn", icon: LinkedinIcon, angle: 30 },
  { name: "Instagram", icon: InstagramIcon, angle: 150 },
];

const orbitTransition = {
  duration: 26,
  repeat: Infinity,
  ease: "linear",
};

export function ConnectorOrbit() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[460px]" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 size-[clamp(15.5rem,28vw,21rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#7fd9e5]/45" />
      <div className="absolute left-1/2 top-1/2 size-[clamp(11.5rem,21vw,15rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#9779c8]/30" />
      <div className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7652ba]/10 blur-3xl" />

      <motion.div
        className="absolute left-1/2 top-1/2 size-px"
        initial={{ rotate: 0 }}
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={orbitTransition}
      >
        {orbitingConnectors.map((connector) => {
          const Icon = connector.icon;

          return (
            <div
              key={connector.name}
              className="absolute left-0 top-0"
              style={{
                transform: `rotate(${connector.angle}deg) translateX(clamp(7.75rem, 14vw, 10.5rem))`,
              }}
            >
              <div style={{ transform: `rotate(${-connector.angle}deg)` }}>
                <motion.div
                  animate={prefersReducedMotion ? undefined : { rotate: -360 }}
                  transition={orbitTransition}
                  className="-translate-x-1/2 -translate-y-1/2"
                >
                  <div className="flex w-20 flex-col items-center gap-2">
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-[#4f378a] shadow-[0_14px_40px_rgba(56,30,114,0.14)] backdrop-blur-md">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#625b71]">
                      {connector.name}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute -inset-7 rounded-full bg-[#7252bd]/20 blur-2xl"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [0.9, 1.15, 0.9], opacity: [0.25, 0.5, 0.25] }
          }
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex size-24 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-[#6546a9] to-[#381e72] text-4xl font-bold text-white shadow-[0_24px_60px_rgba(56,30,114,0.32)]">
          <span className="absolute inset-px rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.2),transparent_42%)]" />
          <span className="relative">J</span>
        </div>
      </div>
    </div>
  );
}

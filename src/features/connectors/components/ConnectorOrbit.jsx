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
      <div className="connector-orbit-track-outer absolute left-1/2 top-1/2 size-[clamp(15.5rem,28vw,21rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" />
      <div className="connector-orbit-track-inner absolute left-1/2 top-1/2 size-[clamp(11.5rem,21vw,15rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed" />
      <div className="connector-orbit-glow absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

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
                    <div className="connector-platform-icon flex size-14 items-center justify-center rounded-2xl border backdrop-blur-md">
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
          className="connector-orbit-glow absolute -inset-7 rounded-full blur-2xl"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [0.9, 1.15, 0.9], opacity: [0.25, 0.5, 0.25] }
          }
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="connector-orbit-core relative flex size-24 items-center justify-center rounded-full border text-4xl font-bold">
          <span className="absolute inset-px rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.2),transparent_42%)]" />
          <span className="relative">J</span>
        </div>
      </div>
    </div>
  );
}

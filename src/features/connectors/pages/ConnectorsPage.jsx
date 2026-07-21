import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../../landing/components/Footer";
import { Navbar } from "../../landing/components/Navbar";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "../../landing/components/BrandIcons";
import { ConnectorCard } from "../components/ConnectorCard";
import { ConnectorOrbit } from "../components/ConnectorOrbit";

const connectors = [
  {
    name: "Facebook",
    type: "Social publishing",
    icon: FacebookIcon,
    accent: "bg-gradient-to-r from-[#68dbe8] via-[#8b72c5] to-transparent",
    description:
      "Turn campaign ideas into page-ready posts while keeping every caption aligned with your brand voice.",
    capabilities: [
      "Page-ready post creation",
      "Campaign scheduling",
      "Audience-aware variations",
    ],
  },
  {
    name: "Instagram",
    type: "Visual storytelling",
    icon: InstagramIcon,
    accent: "bg-gradient-to-r from-[#dc5ed8] via-[#9472c7] to-transparent",
    description:
      "Pair polished visuals with channel-native captions, hooks, and calls to action built for discovery.",
    capabilities: [
      "Caption and hashtag sets",
      "Carousel-ready concepts",
      "Visual campaign briefs",
    ],
  },
  {
    name: "LinkedIn",
    type: "Professional reach",
    icon: LinkedinIcon,
    accent: "bg-gradient-to-r from-[#7caee5] via-[#7760b3] to-transparent",
    description:
      "Shape expert ideas into credible company updates and thought-leadership content for professional audiences.",
    capabilities: [
      "Thought-leadership drafts",
      "Company page publishing",
      "Professional tone adaptation",
    ],
  },
];

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function WorkflowArrow() {
  return (
    <div className="flex items-center justify-center text-[#8b77aa]" aria-hidden="true">
      <ArrowDown className="size-5 lg:hidden" />
      <ArrowRight className="hidden size-5 lg:block" />
    </div>
  );
}

export function ConnectorsPage() {
  const prefersReducedMotion = useReducedMotion();
  const initialState = prefersReducedMotion ? false : "hidden";

  return (
    <div className="min-h-screen overflow-hidden bg-[#fef7ff] text-[#1d1b20]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-[#cbc4d2]/35 pt-[72px]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-10 size-[440px] rounded-full bg-[#64d9e6]/10 blur-[110px]" />
            <div className="absolute -right-28 top-12 size-[500px] rounded-full bg-[#df59d8]/10 blur-[120px]" />
            <div className="absolute left-1/2 top-1/2 size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#987ac9]/15" />
          </div>

          <div className="relative mx-auto grid min-h-[700px] max-w-[1280px] items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <motion.div
              variants={reveal}
              initial={initialState}
              animate="visible"
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-[680px]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cbbdde]/60 bg-white/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62458e] shadow-sm backdrop-blur-md">
                <Sparkles className="size-3.5" />
                Connector ecosystem
              </div>

              <h1 className="mt-8 text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-[#1d1b20] sm:text-6xl lg:text-[76px]">
                One voice.
                <span className="block text-[#4f378a]">Everywhere it matters.</span>
              </h1>
              <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#57515f] sm:text-xl">
                Connect Facebook, Instagram, and LinkedIn to turn one campaign
                strategy into channel-native content without losing your brand.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#connector-library"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#381e72] px-7 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(56,30,114,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
                >
                  Explore connectors
                  <ArrowDown className="size-4" />
                </a>
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#a996c2]/55 bg-white/55 px-7 text-sm font-semibold text-[#381e72] backdrop-blur-md transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
                >
                  Start connecting
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#625b71]">
                {["Brand-safe output", "Channel-native formats", "One workflow"].map(
                  (benefit) => (
                    <span key={benefit} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-[#6c5599]" />
                      {benefit}
                    </span>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              className="relative"
            >
              <ConnectorOrbit />
            </motion.div>
          </div>
        </section>

        <section id="connector-library" className="relative px-6 py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1280px]">
            <motion.div
              variants={reveal}
              initial={initialState}
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-[720px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#70579e]">
                Connector library
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Meet your channels.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5b5562]">
                Each connector carries the same campaign intelligence, then adapts
                the final message to how people expect to engage on that platform.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {connectors.map((connector) => (
                <ConnectorCard key={connector.name} connector={connector} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-8 lg:pb-28">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[36px] border border-[#cfc3dd]/55 bg-[#f4ecfb]/70 px-6 py-14 shadow-[0_26px_80px_rgba(56,30,114,0.08)] sm:px-10 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute right-0 top-0 size-80 rounded-full bg-[#68dce8]/10 blur-[90px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 size-80 rounded-full bg-[#dc63d5]/10 blur-[100px]" />

            <div className="relative text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#70579e]">
                Connected architecture
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                One workflow. Three destinations.
              </h2>
            </div>

            <div className="relative mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
              <div className="rounded-3xl border border-white/80 bg-white/65 p-6 backdrop-blur-md">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ebe2f7] text-[#4f378a]">
                  <BookOpenText className="size-5" />
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#70579e]">
                  01 · Source
                </p>
                <h3 className="mt-2 text-xl font-bold">Your brand voice</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b5562]">
                  Tone, audience, product facts, and campaign objectives enter once.
                </p>
              </div>

              <WorkflowArrow />

              <div className="rounded-3xl border border-[#7859a6]/25 bg-[#381e72] p-6 text-white shadow-[0_20px_50px_rgba(56,30,114,0.22)]">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/12 text-[#d9c7ff]">
                  <Sparkles className="size-5" />
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d6c3fb]">
                  02 · Orchestrate
                </p>
                <h3 className="mt-2 text-xl font-bold">Jasper intelligence</h3>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  One strategy becomes three polished messages, reviewed for fit and
                  consistency.
                </p>
              </div>

              <WorkflowArrow />

              <div className="rounded-3xl border border-white/80 bg-white/65 p-6 backdrop-blur-md">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e3f4f5] text-[#397d86]">
                  <Send className="size-5" />
                </div>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#70579e]">
                  03 · Deliver
                </p>
                <h3 className="mt-2 text-xl font-bold">Channel-native content</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b5562]">
                  Ready-to-publish output arrives in Facebook, Instagram, and LinkedIn.
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex flex-wrap justify-center gap-6 border-t border-[#baa9cd]/35 pt-8 text-sm text-[#554c60]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#4f378a]" />
                Brand governance built in
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#4f378a]" />
                Review before publishing
              </span>
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 lg:px-8 lg:pb-28">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 rounded-[32px] bg-[#381e72] px-7 py-12 text-center text-white shadow-[0_24px_70px_rgba(56,30,114,0.22)] sm:px-12 lg:flex-row lg:text-left">
            <div className="max-w-[720px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c6fb]">
                Ready when you are
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                Bring your channels into one creative system.
              </h2>
            </div>
            <Link
              to="/register"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-[#381e72] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#381e72]"
            >
              Connect your first channel
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

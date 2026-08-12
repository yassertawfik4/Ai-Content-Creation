import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="bg-[#fef7ff] px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="accent-panel mx-auto flex max-w-[1280px] flex-col items-center gap-10 rounded-t-[48px] px-6 py-28 text-center lg:px-24"
      >
        <h2 className="accent-panel-title max-w-[896px] text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Ready to put AI agents to work?
        </h2>
        <p className="accent-panel-copy max-w-[672px] text-lg sm:text-xl">
          Join marketing teams orchestrating their future with Sada.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <Link
            to="/register"
            className="accent-panel-primary rounded-md px-12 py-4 text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            Start Free Trial
          </Link>
          <a
            href="#platform"
            className="accent-panel-secondary rounded-md border-2 px-12 py-4 text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            Get A Demo
          </a>
        </div>
      </motion.div>
    </section>
  );
}

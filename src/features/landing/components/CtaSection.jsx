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
        className="mx-auto flex max-w-[1280px] flex-col items-center gap-10 rounded-t-[48px] bg-[#4f378a] px-6 py-28 text-center lg:px-24"
      >
        <h2 className="max-w-[896px] text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ready to put AI agents to work?
        </h2>
        <p className="max-w-[672px] text-lg text-white/80 sm:text-xl">
          Join 100,000+ marketing teams orchestrating their future with Jasper.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <Link
            to="/register"
            className="rounded-md bg-[#fef7ff] px-12 py-4 text-sm font-semibold text-[#4f378a] transition-all hover:bg-white"
          >
            Start Free Trial
          </Link>
          <a
            href="#platform"
            className="rounded-md border-2 border-white px-12 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            Get A Demo
          </a>
        </div>
      </motion.div>
    </section>
  );
}

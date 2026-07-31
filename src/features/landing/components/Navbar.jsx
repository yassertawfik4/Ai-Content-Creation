import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Generate", to: "/generate" },
  { label: "Connectors", to: "/connectors" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-[#cbc4d2]/40 bg-[#fef7ff]/80 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#381e72] text-base font-bold text-white">
            J
          </span>
          <span className="text-lg font-bold tracking-tight text-[#1d1b20]">
            Jasper <span className="text-[#4f378a]">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-[#494551] transition-colors hover:text-[#381e72]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#494551] transition-colors hover:text-[#381e72]"
              >
                {link.label}
              </a>
            )
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-[#494551] transition-colors hover:text-[#381e72]"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-[#381e72] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4f378a]"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-11 items-center justify-center rounded-lg text-[#1d1b20] transition-colors hover:bg-[#eee7f2] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-[#cbc4d2]/40 bg-[#fef7ff]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-2 px-6 py-4">
              {navLinks.map((link) => (
                link.to ? (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <hr className="my-2 border-[#cbc4d2]/40" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg bg-[#381e72] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

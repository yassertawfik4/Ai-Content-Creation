import { ChevronDown, Loader2, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Generate", to: "/generate" },
  { label: "Connectors", to: "/connectors" },
  { label: "Knowledge", to: "/knowledge" },
  { label: "Pricing", href: "/#pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);
  const accountButtonRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const closeOnOutsidePress = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setAccountOpen(false);
      accountButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logout();
    setMobileOpen(false);
    setAccountOpen(false);
    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

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
          <span className="text-xl font-bold tracking-tight text-[#1d1b20]">
            Jasper <span className="text-[#4f378a]">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className="text-base font-medium text-[#494551] transition-colors hover:text-[#381e72]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-[#494551] transition-colors hover:text-[#381e72]"
              >
                {link.label}
              </a>
            )
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <div ref={accountMenuRef} className="relative">
              <button
                ref={accountButtonRef}
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
                className="flex min-h-11 items-center gap-2 rounded-xl px-2 transition-colors hover:bg-[#eee7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-controls="navbar-account-menu"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#e3d5f7] text-xs font-bold text-[#381e72] ring-1 ring-[#cbb9e3]">
                  {initials || "A"}
                </span>
                <span className="max-w-[160px] truncate text-base font-medium text-[#494551]">
                  {user?.name ?? "Account"}
                </span>
                <ChevronDown className={`size-3.5 text-[#6f6575] transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {accountOpen ? (
                  <motion.div
                    id="navbar-account-menu"
                    role="menu"
                    aria-label="Account menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+7px)] z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-[#ded7e3] bg-[#fffaff] p-2 shadow-[0_16px_40px_rgba(45,31,52,0.16)]"
                  >
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-[#201a25]">{user?.name || "AetherFlow user"}</p>
                      {user?.email ? <p className="mt-0.5 truncate text-xs text-[#7b7180]">{user.email}</p> : null}
                    </div>
                    <div className="my-1 h-px bg-[#e7dfe9]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold text-[#9f2949] transition-colors hover:bg-[#fbe9ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad3150] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isLoggingOut ? <Loader2 className="size-[17px] animate-spin" /> : <LogOut className="size-[17px]" />}
                      {isLoggingOut ? "Logging out…" : "Log out"}
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-base font-medium text-[#494551] transition-colors hover:text-[#381e72]"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-[#381e72] px-6 py-2.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#4f378a]"
              >
                Get Started
              </Link>
            </>
          )}
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
                    className="rounded-lg px-3 py-3 text-base text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-base text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <hr className="my-2 border-[#cbc4d2]/40" />
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#e3d5f7] text-xs font-bold text-[#381e72] ring-1 ring-[#cbb9e3]">
                      {initials}
                    </span>
                    <span className="truncate text-base font-medium text-[#494551]">
                      {user?.name ?? "Account"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#381e72] px-3 py-2.5 text-center text-base font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                    {isLoggingOut ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-base text-[#494551] transition-colors hover:bg-[#f2ecf3] hover:text-[#381e72]"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-1 rounded-lg bg-[#381e72] px-3 py-2.5 text-center text-base font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

import { ArrowUpRight, Check, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function ConnectorCard({ connector }) {
  const Icon = connector.icon;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#d8cfdf]/75 bg-white/70 p-6 shadow-[0_18px_60px_rgba(56,30,114,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#aa91ce]/70 hover:shadow-[0_24px_70px_rgba(56,30,114,0.13)] sm:p-8">
      <div className={`absolute inset-x-0 top-0 h-1 ${connector.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[#d6ccdf] bg-[#f8f3ff] text-[#4f378a] shadow-sm">
          <Icon className="size-6" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#92cbb7]/35 bg-[#e8f7f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#276749]">
          <CircleCheck className="size-3.5" />
          Ready
        </span>
      </div>

      <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#70579e]">
        {connector.type}
      </p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#1d1b20]">
        {connector.name}
      </h3>
      <p className="mt-4 text-sm leading-6 text-[#57515f]">
        {connector.description}
      </p>

      <ul className="mt-6 space-y-3" aria-label={`${connector.name} capabilities`}>
        {connector.capabilities.map((capability) => (
          <li key={capability} className="flex items-center gap-3 text-sm text-[#3f3945]">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#eee6fb] text-[#4f378a]">
              <Check className="size-3" strokeWidth={2.5} />
            </span>
            {capability}
          </li>
        ))}
      </ul>

      <Link
        to="/register"
        className="mt-8 inline-flex min-h-12 items-center justify-between rounded-xl border border-[#b9a8cf]/55 bg-[#fbf8ff] px-4 text-sm font-semibold text-[#381e72] transition-colors duration-200 hover:border-[#70579e]/60 hover:bg-[#f1e9fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2"
      >
        Connect {connector.name}
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </article>
  );
}

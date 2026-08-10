import { FileText, Globe2, RefreshCw, Trash2 } from "lucide-react";

const statusStyles = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  INDEXING: "border-sky-200 bg-sky-50 text-sky-800",
  READY: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-rose-200 bg-rose-50 text-rose-800",
};

export function KnowledgeSourcesList({ sources, busy, onRefresh, onDelete, onReindex }) {
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#70579e]">Your library</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#29222f]">Indexed sources</h2></div>
        <button disabled={busy || !sources.length} onClick={onReindex} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cabdde] bg-white px-3.5 text-sm font-bold text-[#4f378a] transition hover:bg-[#f3edfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed disabled:opacity-45"><RefreshCw className="size-4" />Refresh all</button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-[#ded7e3] bg-white shadow-[0_12px_30px_rgba(70,48,96,0.05)]">
        {sources.length ? sources.map((source) => <SourceRow key={source.id} source={source} busy={busy} onRefresh={onRefresh} onDelete={onDelete} />) : <EmptySources />}
      </div>
    </section>
  );
}

function SourceRow({ source, busy, onRefresh, onDelete }) {
  const Icon = source.type === "WEBSITE" ? Globe2 : FileText;
  const status = source.status ?? "PENDING";
  const details = source.url ?? `${String(source.type ?? "document").toLowerCase()} source`;

  return (
    <article className="flex flex-col gap-4 border-b border-[#eee8f0] p-4 last:border-0 sm:flex-row sm:items-center sm:p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0eafb] text-[#4f378a]"><Icon className="size-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#302936]">{source.name}</h3><span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>{status.toLowerCase()}</span></div>
        <p className="mt-1 truncate text-sm text-[#71677a]">{details}{source.metadata?.pageCount ? ` · ${source.metadata.pageCount} pages` : ""}{source.metadata?.embeddingModel ? ` · ${source.metadata.embeddingModel}` : ""}</p>
        {source.error ? <p className="mt-1 text-xs text-rose-700">{source.error}</p> : null}
        {source.metadata?.crawlWarnings?.length ? <p className="mt-1 text-xs text-amber-800">{source.metadata.crawlWarnings.length} crawl warning{source.metadata.crawlWarnings.length === 1 ? "" : "s"}</p> : null}
      </div>
      <div className="flex shrink-0 gap-1.5 self-end sm:self-auto">
        <ActionButton label={`Refresh ${source.name}`} disabled={busy} onClick={() => onRefresh(source.id)}><RefreshCw className="size-4" /></ActionButton>
        <ActionButton label={`Delete ${source.name}`} disabled={busy} onClick={() => onDelete(source.id)} danger><Trash2 className="size-4" /></ActionButton>
      </div>
    </article>
  );
}

function EmptySources() {
  return <div className="px-5 py-10 text-center sm:py-12"><span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#f0eafb] text-[#4f378a]"><Globe2 className="size-5" /></span><h3 className="mt-4 font-bold text-[#322a38]">Your library is waiting</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#71677a]">Add a website, document, or approved social posts to give your next workflow better context.</p></div>;
}

function ActionButton({ label, disabled, onClick, danger = false, children }) {
  return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`flex size-9 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed disabled:opacity-45 ${danger ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-[#dcd2e4] text-[#5a477e] hover:bg-[#f0eafb]"}`}>{children}</button>;
}

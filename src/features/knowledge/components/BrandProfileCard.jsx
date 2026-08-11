import { ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";

export function BrandProfileCard({ value, onChange, onSave, busy }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasVoice = Boolean(value.voice.trim());

  return (
    <section className="rounded-[24px] border border-[#ded7e3] bg-[#faf6fd] p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8def4] text-[#4f378a]"><SlidersHorizontal className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#2a2330]">Brand rules</h2>
              <p className="mt-1 text-sm leading-5 text-[#71677a]">Give every workflow a consistent voice.</p>
            </div>
            <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[#4f378a] hover:bg-[#eee7f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]" aria-expanded={isOpen}>
              {isOpen ? "Close" : hasVoice ? "Edit" : "Set rules"}<ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {!isOpen ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#534a5a]">{hasVoice ? value.voice : "No brand rules yet. Add a short voice and any terms your team wants to guide or avoid."}</p> : null}
        </div>
      </div>

      {isOpen ? (
        <form className="mt-6 grid gap-4 border-t border-[#e4dbea] pt-5 sm:grid-cols-2" onSubmit={onSave}>
          <Field label="Voice" className="sm:col-span-2">
            <textarea required minLength="3" value={value.voice} onChange={(event) => onChange("voice", event.target.value)} placeholder="Confident, energetic, and helpful—not aggressive." className="knowledge-input min-h-20 resize-y" />
          </Field>
          <Field label="Preferred terms" hint="One per line">
            <textarea value={value.preferredTerms} onChange={(event) => onChange("preferredTerms", event.target.value)} placeholder="high-protein\nmacros\nfresh meals" className="knowledge-input min-h-24 resize-y" />
          </Field>
          <Field label="Avoid these terms" hint="One per line">
            <textarea value={value.prohibitedTerms} onChange={(event) => onChange("prohibitedTerms", event.target.value)} placeholder="guaranteed weight loss\nbody shaming" className="knowledge-input min-h-24 resize-y" />
          </Field>
          <Field label="Writing rules" hint="One per line">
            <textarea value={value.writingRules} onChange={(event) => onChange("writingRules", event.target.value)} placeholder="Keep sentences concise\nLead with a practical benefit" className="knowledge-input min-h-24 resize-y" />
          </Field>
          <div className="grid gap-4">
            <Field label="CTA guidance"><input value={value.ctaGuidance} onChange={(event) => onChange("ctaGuidance", event.target.value)} placeholder="Build your box" className="knowledge-input" /></Field>
            <Field label="Language guidance"><input value={value.languageGuidance} onChange={(event) => onChange("languageGuidance", event.target.value)} placeholder="Egyptian Arabic + clear English terms" className="knowledge-input" /></Field>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-3">
            <p className="hidden text-xs text-[#766b7e] sm:block">These rules apply to new strategies and content.</p>
            <button disabled={busy || value.voice.trim().length < 3} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4f378a] px-4 text-sm font-bold text-white transition hover:bg-[#3d296e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="size-4" />Save rules</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function Field({ label, hint, className = "", children }) {
  return <label className={`block text-sm font-semibold text-[#443a4a] ${className}`}><span>{label}</span>{hint ? <span className="ml-1 text-xs font-normal text-[#7a7080]">· {hint}</span> : null}<div className="mt-2">{children}</div></label>;
}

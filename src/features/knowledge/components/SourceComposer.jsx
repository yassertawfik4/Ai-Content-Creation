import { AtSign, BookOpen, FileText, Globe2, Plus } from "lucide-react";
import { useState } from "react";

const sourceOptions = [
  { id: "website", icon: Globe2, label: "Website", hint: "Pages you own" },
  { id: "document", icon: FileText, label: "Document", hint: "Guidelines & facts" },
  { id: "social", icon: AtSign, label: "Social posts", hint: "Approved captions" },
];

export function SourceComposer({ busy, onAddWebsite, onAddDocument, onAddSocial }) {
  const [type, setType] = useState("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [socialAccount, setSocialAccount] = useState("");
  const [socialPosts, setSocialPosts] = useState("");

  const submitWebsite = async (event) => {
    event.preventDefault();
    if (await onAddWebsite(websiteUrl)) setWebsiteUrl("");
  };

  const submitDocument = async (event) => {
    event.preventDefault();
    if (await onAddDocument({ name: documentName, content: documentContent })) {
      setDocumentName("");
      setDocumentContent("");
    }
  };

  const submitSocial = async (event) => {
    event.preventDefault();
    if (await onAddSocial({ accountName: socialAccount, posts: socialPosts.split(/\n\s*\n/).filter(Boolean) })) {
      setSocialAccount("");
      setSocialPosts("");
    }
  };

  return (
    <section className="rounded-[24px] border border-[#ded7e3] bg-white p-5 shadow-[0_12px_30px_rgba(70,48,96,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#70579e]">Build your library</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[#27202d]">Add a trusted source</h2>
          <p className="mt-1 text-sm leading-5 text-[#71677a]">Choose one source type, then add only what your team has approved.</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eee7f6] text-[#4f378a]"><BookOpen className="size-5" /></span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {sourceOptions.map((option) => {
          const Icon = option.icon;
          const selected = type === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setType(option.id)}
              className={`rounded-xl border px-2 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${selected ? "border-[#4f378a] bg-[#f0eafb] text-[#3c2675] shadow-sm" : "border-[#e6dfea] bg-[#fff] text-[#5f5568] hover:border-[#cfc1dc] hover:bg-[#fdfaff]"}`}
              aria-pressed={selected}
            >
              <Icon className="size-4" />
              <span className="mt-2 block text-xs font-bold">{option.label}</span>
              <span className="mt-0.5 hidden text-[11px] leading-4 opacity-75 sm:block">{option.hint}</span>
            </button>
          );
        })}
      </div>

      {type === "website" ? (
        <form className="mt-5" onSubmit={submitWebsite}>
          <FormLabel label="Website address" hint="We’ll use it to discover public pages from this domain.">
            <input required type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://yourbrand.com" className="knowledge-input" />
          </FormLabel>
          <SubmitButton disabled={busy}>Add website</SubmitButton>
        </form>
      ) : null}

      {type === "document" ? (
        <form className="mt-5 space-y-4" onSubmit={submitDocument}>
          <FormLabel label="Document name">
            <input required value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder="Brand guidelines" className="knowledge-input" />
          </FormLabel>
          <FormLabel label="Approved content">
            <textarea required value={documentContent} onChange={(event) => setDocumentContent(event.target.value)} placeholder="Paste your brand guidelines, product facts, or case-study text…" className="knowledge-input min-h-28 resize-y" />
          </FormLabel>
          <SubmitButton disabled={busy}>Index document</SubmitButton>
        </form>
      ) : null}

      {type === "social" ? (
        <form className="mt-5 space-y-4" onSubmit={submitSocial}>
          <FormLabel label="Account name">
            <input required value={socialAccount} onChange={(event) => setSocialAccount(event.target.value)} placeholder="@yourbrand" className="knowledge-input" />
          </FormLabel>
          <FormLabel label="Approved posts" hint="Separate posts with a blank line.">
            <textarea required value={socialPosts} onChange={(event) => setSocialPosts(event.target.value)} placeholder="Paste one approved post per paragraph…" className="knowledge-input min-h-28 resize-y" />
          </FormLabel>
          <SubmitButton disabled={busy}>Index posts</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}

function FormLabel({ label, hint, children }) {
  return <label className="block text-sm font-semibold text-[#443a4a]"><span>{label}</span>{hint ? <span className="mt-1 block text-xs font-normal text-[#7a7080]">{hint}</span> : null}<div className="mt-2">{children}</div></label>;
}

function SubmitButton({ disabled, children }) {
  return <button disabled={disabled} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#4f378a] px-4 text-sm font-bold text-white transition hover:bg-[#3d296e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-4" />{children}</button>;
}

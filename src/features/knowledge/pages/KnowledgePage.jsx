import { useCallback, useEffect, useState } from "react";
import { BookOpen, FileText, Globe2, Loader2, MessageSquare, RefreshCw, Send, Trash2, Wand2 } from "lucide-react";
import { Navbar } from "@/features/landing/components/Navbar";
import {
  addDocumentKnowledgeSource,
  addSocialKnowledgeSource,
  addWebsiteKnowledgeSource,
  askProjectKnowledge,
  deleteKnowledgeSource,
  listKnowledgeSources,
  listProjects,
  refreshKnowledgeSource,
  reindexProjectKnowledge,
  updateProjectBrandProfile,
  uploadDocumentKnowledgeSource,
} from "@/lib/campaignApi";

const statusStyle = {
  PENDING: "bg-amber-100 text-amber-800",
  INDEXING: "bg-sky-100 text-sky-800",
  READY: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
};

export function KnowledgePage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [socialAccount, setSocialAccount] = useState("");
  const [socialPosts, setSocialPosts] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);
  const [brandVoice, setBrandVoice] = useState("");
  const [preferredTerms, setPreferredTerms] = useState("");
  const [prohibitedTerms, setProhibitedTerms] = useState("");
  const [writingRules, setWritingRules] = useState("");
  const [ctaGuidance, setCtaGuidance] = useState("");
  const [languageGuidance, setLanguageGuidance] = useState("");

  const loadSources = useCallback(async (id) => {
    if (!id) { setSources([]); return; }
    setSources(await listKnowledgeSources(id));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve(listProjects())
      .then((items) => {
        if (!active) return;
        setProjects(items);
        const first = items[0]?.id ?? "";
        setProjectId(first);
        const profile = items[0]?.brandProfile;
        setBrandVoice(profile?.voice ?? "");
        setPreferredTerms((profile?.preferredTerms ?? []).join("\n"));
        setProhibitedTerms((profile?.prohibitedTerms ?? []).join("\n"));
        setWritingRules((profile?.writingRules ?? []).join("\n"));
        setCtaGuidance(profile?.ctaGuidance ?? "");
        setLanguageGuidance(profile?.languageGuidance ?? "");
        return loadSources(first);
      })
      .catch((cause) => active && setError(cause.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [loadSources]);

  const run = async (operation) => {
    if (!projectId || busy) return;
    setBusy(true); setError("");
    try { await operation(); await loadSources(projectId); }
    catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  };

  const ask = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!projectId || !text || asking) return;
    setAsking(true); setError(""); setQuestion("");
    try {
      const result = await askProjectKnowledge(projectId, text);
      setChat((items) => [...items, { question: text, ...result }]);
    } catch (cause) { setError(cause.message); }
    finally { setAsking(false); }
  };

  const lines = (value) => value.split(/\n+/).map((item) => item.trim()).filter(Boolean);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-7 animate-spin text-[#4f378a]" /></div>;

  return (
    <div className="min-h-screen bg-[#fef7ff] text-[#1d1b20]"><Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-[#ded7e3] pb-8 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#70579e]">Project intelligence</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Knowledge base</h1><p className="mt-3 max-w-2xl text-[#625b71]">Ground new strategies in your approved website, brand documents, and official social content.</p></div>
          <label className="text-sm font-semibold text-[#4a4353]">Project<select value={projectId} onChange={(event) => { const id = event.target.value; const profile = projects.find((project) => project.id === id)?.brandProfile; setProjectId(id); setBrandVoice(profile?.voice ?? ""); setPreferredTerms((profile?.preferredTerms ?? []).join("\n")); setProhibitedTerms((profile?.prohibitedTerms ?? []).join("\n")); setWritingRules((profile?.writingRules ?? []).join("\n")); setCtaGuidance(profile?.ctaGuidance ?? ""); setLanguageGuidance(profile?.languageGuidance ?? ""); void loadSources(id); }} className="mt-2 block min-h-11 min-w-56 rounded-xl border border-[#cbbdde] bg-white px-3 font-normal"><option value="">Choose a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        </div>
        {error ? <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
        {!projectId ? <p className="mt-10 text-[#625b71]">Create a project first, then add trusted source material.</p> : <>
          <section className="mt-8 rounded-2xl border border-[#ded7e3] bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eee7f6] text-[#4f378a]"><Wand2 className="size-5" /></span><div><h2 className="font-bold">Brand voice</h2><p className="mt-1 text-sm text-[#726979]">Project-level rules applied to every strategy and content generation.</p></div></div><form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void run(async () => { const brandProfile = { voice: brandVoice.trim(), preferredTerms: lines(preferredTerms), prohibitedTerms: lines(prohibitedTerms), writingRules: lines(writingRules), ...(ctaGuidance.trim() ? { ctaGuidance: ctaGuidance.trim() } : {}), ...(languageGuidance.trim() ? { languageGuidance: languageGuidance.trim() } : {}) }; await updateProjectBrandProfile(projectId, brandProfile); setProjects((items) => items.map((project) => project.id === projectId ? { ...project, brandProfile } : project)); }); }}><label className="md:col-span-2 text-sm font-semibold">Voice<textarea required minLength="3" value={brandVoice} onChange={(event) => setBrandVoice(event.target.value)} placeholder="Confident, energetic, supportive—not aggressive." className="field mt-1 min-h-20" /></label><VoiceList label="Preferred terms (one per line)" value={preferredTerms} onChange={setPreferredTerms} placeholder="high-protein\nmacros\nfresh meals" /><VoiceList label="Never use (one per line)" value={prohibitedTerms} onChange={setProhibitedTerms} placeholder="guaranteed weight loss\nbody shaming" /><VoiceList label="Writing rules (one per line)" value={writingRules} onChange={setWritingRules} placeholder="Keep sentences concise\nLead with a practical benefit" /><label className="text-sm font-semibold">CTA guidance<input value={ctaGuidance} onChange={(event) => setCtaGuidance(event.target.value)} placeholder="Build your box" className="field mt-1" /></label><label className="text-sm font-semibold">Language guidance<input value={languageGuidance} onChange={(event) => setLanguageGuidance(event.target.value)} placeholder="Egyptian Arabic + clear English fitness terms" className="field mt-1" /></label><div className="md:col-span-2"><button disabled={busy || brandVoice.trim().length < 3} className="button">Save brand voice</button></div></form></section>
          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            <SourceCard icon={<Globe2 />} title="Website" description="Crawl public brand pages and cite the exact supporting page in new workflows."><form onSubmit={(event) => { event.preventDefault(); void run(async () => { await addWebsiteKnowledgeSource(projectId, { url: websiteUrl }); setWebsiteUrl(""); }); }} className="space-y-3"><input required type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://yourbrand.com" className="field" /><button disabled={busy} className="button">Add website</button></form></SourceCard>
            <SourceCard icon={<FileText />} title="Brand document" description="Upload a PDF, TXT, or Markdown file, or paste approved source material.">
              <form onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                void run(async () => {
                  if (documentFile) {
                    await uploadDocumentKnowledgeSource(projectId, documentFile);
                    setDocumentFile(null);
                    form.reset();
                  } else {
                    await addDocumentKnowledgeSource(projectId, { name: documentName, content: documentContent });
                    setDocumentName("");
                    setDocumentContent("");
                  }
                });
              }} className="space-y-3">
                <label className="block text-xs font-semibold text-[#625b71]">Document file<input type="file" accept="application/pdf,text/plain,text/markdown,.pdf,.txt,.md" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#f2eafa] file:px-3 file:py-2 file:font-semibold file:text-[#4f378a]" /></label>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-[#95899c]"><span className="h-px flex-1 bg-[#e5dce7]" />or paste text<span className="h-px flex-1 bg-[#e5dce7]" /></div>
                <input required={!documentFile} disabled={Boolean(documentFile)} value={documentName} onChange={(event) => setDocumentName(event.target.value)} placeholder="Brand guidelines" className="field" />
                <textarea required={!documentFile} disabled={Boolean(documentFile)} value={documentContent} onChange={(event) => setDocumentContent(event.target.value)} placeholder="Paste approved material…" className="field min-h-24" />
                <button disabled={busy || (!documentFile && (!documentName.trim() || !documentContent.trim()))} className="button">{documentFile ? "Upload and index" : "Index document"}</button>
              </form>
            </SourceCard>
            <SourceCard icon={<BookOpen />} title="Official social posts" description="Paste an export from your connected Meta business account."><form onSubmit={(event) => { event.preventDefault(); void run(async () => { await addSocialKnowledgeSource(projectId, { platform: "instagram", accountName: socialAccount, posts: socialPosts.split(/\n\s*\n/).filter(Boolean) }); setSocialAccount(""); setSocialPosts(""); }); }} className="space-y-3"><input required value={socialAccount} onChange={(event) => setSocialAccount(event.target.value)} placeholder="@yourbrand" className="field" /><textarea required value={socialPosts} onChange={(event) => setSocialPosts(event.target.value)} placeholder="One post per paragraph…" className="field min-h-24" /><button disabled={busy} className="button">Index posts</button></form></SourceCard>
          </section>
          <section className="mt-10"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Indexed sources</h2><button disabled={busy || !sources.length} onClick={() => void run(() => reindexProjectKnowledge(projectId))} className="button">Re-index for local RAG</button></div><div className="mt-4 overflow-hidden rounded-2xl border border-[#ded7e3] bg-white">{sources.length ? sources.map((source) => <div key={source.id} className="flex flex-col gap-3 border-b border-[#eee8f0] p-5 last:border-0 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{source.name}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[source.status] ?? "bg-slate-100"}`}>{source.status.toLowerCase()}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${source.freshness?.status === "fresh" ? "bg-emerald-50 text-emerald-700" : source.freshness?.status === "stale" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{String(source.freshness?.status ?? "unknown").replaceAll("-", " ")}</span></div><p className="mt-1 truncate text-sm text-[#726979]">{source.url ?? `${source.type.toLowerCase()} source`}{source.metadata?.pageCount ? ` · ${source.metadata.pageCount} pages` : ""}{source.metadata?.embeddingModel ? ` · ${source.metadata.embeddingModel}` : ""}{source.error ? ` — ${source.error}` : ""}</p>{source.freshness?.refreshAfter ? <p className="mt-1 text-xs text-[#84798a]">Refresh recommended by {new Date(source.freshness.refreshAfter).toLocaleDateString()}</p> : null}{source.metadata?.crawlWarnings?.length ? <p className="mt-1 text-xs text-amber-800">{source.metadata.crawlWarnings.length} crawl warning{source.metadata.crawlWarnings.length === 1 ? "" : "s"}</p> : null}</div><div className="flex gap-2"><button aria-label={`Refresh ${source.name}`} disabled={busy} onClick={() => void run(() => refreshKnowledgeSource(projectId, source.id))} className="icon-button"><RefreshCw className="size-4" /></button><button aria-label={`Delete ${source.name}`} disabled={busy} onClick={() => void run(() => deleteKnowledgeSource(projectId, source.id))} className="icon-button text-rose-700"><Trash2 className="size-4" /></button></div></div>) : <p className="p-8 text-sm text-[#726979]">No trusted material yet. Add a source to ground your next workflow run.</p>}</div></section>
          <section className="mt-10 max-w-3xl rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#eee7f6] text-[#4f378a]"><MessageSquare className="size-5" /></span><div><h2 className="font-bold">Ask your knowledge base</h2><p className="text-sm text-[#726979]">Testing only: shows the retrieved excerpts and citations without generating a marketing strategy.</p></div></div><div className="mt-5 space-y-4">{chat.map((message, index) => <div key={`${message.question}-${index}`} className="space-y-2"><p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-[#4f378a] px-4 py-2 text-sm text-white">{message.question}</p><div className="max-w-[92%] rounded-2xl bg-[#f4eff8] px-4 py-3 text-sm whitespace-pre-wrap">{message.answer}</div>{message.citations?.length ? <div className="flex flex-wrap gap-2">{message.citations.map((citation, citationIndex) => citation.url ? <a key={`${citation.sourceId}-${citationIndex}`} href={citation.url} target="_blank" rel="noreferrer" className="rounded-full border border-[#cbbdde] px-3 py-1 text-xs text-[#4f378a] hover:bg-[#eee7f6]">{citation.title}</a> : <span key={`${citation.sourceId}-${citationIndex}`} className="rounded-full border border-[#cbbdde] px-3 py-1 text-xs text-[#4f378a]">{citation.title}</span>)}</div> : null}</div>)}{asking ? <p className="text-sm text-[#726979]"><Loader2 className="mr-2 inline size-4 animate-spin" />Searching your indexed knowledge…</p> : null}</div><form onSubmit={ask} className="mt-5 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={asking} placeholder="Ask about your indexed sources…" className="field min-w-0 flex-1" /><button disabled={asking || !question.trim()} className="button" aria-label="Ask knowledge base"><Send className="size-4" /></button></form></section>
        </>}
      </main>
    </div>
  );
}

function SourceCard({ icon, title, description, children }) { return <section className="rounded-2xl border border-[#ded7e3] bg-white p-5 shadow-sm"><div className="flex size-10 items-center justify-center rounded-xl bg-[#eee7f6] text-[#4f378a]">{icon}</div><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 min-h-10 text-sm text-[#726979]">{description}</p><div className="mt-4">{children}</div></section>; }
function VoiceList({ label, value, onChange, placeholder }) { return <label className="text-sm font-semibold">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field mt-1 min-h-24" /></label>; }

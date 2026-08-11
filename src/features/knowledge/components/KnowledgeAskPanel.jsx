import { Loader2, MessageSquare, Send } from "lucide-react";

export function KnowledgeAskPanel({ chat, question, onQuestionChange, onSubmit, asking }) {
  return (
    <section className="mt-8 rounded-[24px] border border-[#ded7e3] bg-[#2e1268] p-5 text-white shadow-[0_18px_38px_rgba(50,19,102,0.16)] sm:p-6">
      <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#e9dbff]"><MessageSquare className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d9c7f8]">Quick check</p><h2 className="mt-1 text-xl font-bold">Ask your library</h2><p className="mt-1 text-sm leading-5 text-[#ddd0ef]">Test what the system can retrieve before generating a strategy.</p></div></div>
      {chat.length ? <div className="mt-6 max-h-96 space-y-5 overflow-y-auto pr-1">{chat.map((message, index) => <ChatMessage key={`${message.question}-${index}`} message={message} />)}</div> : null}
      {asking ? <p className="mt-5 text-sm text-[#e8dcf8]"><Loader2 className="mr-2 inline size-4 animate-spin" />Searching your sources…</p> : null}
      <form onSubmit={onSubmit} className="mt-5 flex gap-2"><input value={question} onChange={(event) => onQuestionChange(event.target.value)} disabled={asking} placeholder="Ask about your indexed sources…" className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-[#d5c7e7] transition focus:border-white/55 focus:ring-2 focus:ring-white/20 disabled:opacity-60" /><button disabled={asking || !question.trim()} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#43247e] transition hover:bg-[#f3edfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e1268] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Ask knowledge base"><Send className="size-4" /></button></form>
    </section>
  );
}

function ChatMessage({ message }) {
  return <article className="space-y-2"><p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-white px-3.5 py-2 text-sm font-medium text-[#34205c]">{message.question}</p><div className="max-w-[95%] rounded-2xl rounded-tl-md bg-white/10 px-3.5 py-3 text-sm leading-6 text-white whitespace-pre-wrap">{message.answer}</div>{message.citations?.length ? <div className="flex flex-wrap gap-2">{message.citations.map((citation, index) => citation.url ? <a key={`${citation.sourceId}-${index}`} href={citation.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-[#f2eaff] transition hover:bg-white/10">{citation.title}</a> : <span key={`${citation.sourceId}-${index}`} className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-[#f2eaff]">{citation.title}</span>)}</div> : null}</article>;
}

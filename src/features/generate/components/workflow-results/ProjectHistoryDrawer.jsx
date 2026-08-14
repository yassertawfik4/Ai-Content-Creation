import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, History, Loader2, X } from 'lucide-react'
import { WorkflowBilling } from './WorkflowStatus'

export function ProjectHistoryDrawer({ project, chat, entries, isLoading, onClose, onOpenEntry }) {
  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 28 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#d9cfe0] bg-[#fffaff] shadow-[-20px_0_60px_rgba(46,32,51,0.16)]"
        aria-label={`${chat.title} history in ${project.name}`}
      >
        <div className="flex items-start gap-3 border-b border-[#e5dee7] px-5 py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#381e72] text-[#d8ff9d]">
            <History className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#84788c]">{project.name} · Chat history</p>
            <h2 className="truncate font-display text-xl text-[#201a25]">{chat.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close history" className="ml-auto flex size-9 items-center justify-center rounded-lg text-[#716777] hover:bg-[#f1eaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
            <X className="size-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#746b79]"><Loader2 className="size-4 animate-spin" /> Loading history…</div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfc2d5] bg-[#f8f3f8] px-6 py-12 text-center">
              <Clock3 className="mx-auto size-6 text-[#8d7c98]" />
              <p className="mt-3 text-sm font-semibold text-[#381e72]">No workflow runs yet</p>
              <p className="mt-1 text-xs leading-5 text-[#807586]">Build a strategy and create posts. Each result will be saved here automatically.</p>
            </div>
          ) : (
            <ol className="space-y-2">
              {entries.map((entry) => {
                const canOpen = entry.status === 'success' && entry.result
                return (
                  <li key={entry.id} className="rounded-2xl border border-[#e2d9e6] bg-white p-4 shadow-[0_5px_16px_rgba(46,32,51,0.05)]">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${entry.status === 'success' ? 'bg-[#6aa51f]' : entry.status === 'failed' ? 'bg-[#ad3150]' : 'bg-[#a17b24]'}`} />
                      <p className="text-sm font-semibold capitalize text-[#201a25]">{entry.kind} workflow</p>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a7f90]">{entry.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#807586]">{new Date(entry.createdAt).toLocaleString()}</p>
                    {entry.postCount > 0 ? <p className="mt-1 text-xs font-medium text-[#4f378a]">{entry.postCount} posts generated</p> : null}
                    <WorkflowBilling billing={entry.billing} executions={entry.executions} compact />
                    {entry.error ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#a1385a]">{entry.error}</p> : null}
                    {canOpen ? (
                      <button type="button" onClick={() => onOpenEntry(entry)} className="mt-3 h-9 rounded-lg bg-[#f2eafa] px-3 text-xs font-semibold text-[#381e72] transition hover:bg-[#e8dcf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                        Open saved result
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

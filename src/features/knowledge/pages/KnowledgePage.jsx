import { Loader2 } from 'lucide-react'
import { Navbar } from '@/features/landing/components/Navbar'
import { BrandProfileCard } from '@/features/knowledge/components/BrandProfileCard'
import { KnowledgeAskPanel } from '@/features/knowledge/components/KnowledgeAskPanel'
import { KnowledgeHero } from '@/features/knowledge/components/KnowledgeHero'
import { KnowledgeSourcesList } from '@/features/knowledge/components/KnowledgeSourcesList'
import { SourceComposer } from '@/features/knowledge/components/SourceComposer'
import { useKnowledgeWorkspace } from '@/features/knowledge/hooks/useKnowledgeWorkspace'

export function KnowledgePage() {
  const workspace = useKnowledgeWorkspace()

  if (workspace.loading) {
    return <div className="grid min-h-screen place-items-center bg-[#fef7ff]"><Loader2 className="size-7 animate-spin text-[#4f378a]" /></div>
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] text-[#1d1b20]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <KnowledgeHero projects={workspace.projects} projectId={workspace.projectId} onProjectChange={workspace.selectProject} sourceCount={workspace.sources.length} readyCount={workspace.readyCount} disabled={workspace.busy || workspace.asking} />

        {workspace.error ? <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{workspace.error}</p> : null}

        {!workspace.projectId ? <EmptyProjectState /> : (
          <>
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-start">
              <SourceComposer busy={workspace.busy} onAddWebsite={workspace.addWebsite} onAddDocument={workspace.addDocument} onAddSocial={workspace.addSocial} />
              <BrandProfileCard value={workspace.profile} onChange={workspace.updateProfileField} onSave={workspace.saveProfile} busy={workspace.busy} />
            </div>

            <KnowledgeSourcesList
              sources={workspace.sources}
              busy={workspace.busy}
              onReindex={() => void workspace.reindex()}
              onRefresh={(sourceId) => void workspace.refreshSource(sourceId)}
              onDelete={(sourceId) => void workspace.deleteSource(sourceId)}
            />

            <KnowledgeAskPanel chat={workspace.chat} question={workspace.question} onQuestionChange={workspace.setQuestion} onSubmit={workspace.ask} asking={workspace.asking} />
          </>
        )}
      </main>
    </div>
  )
}

function EmptyProjectState() {
  return <section className="mt-8 rounded-[24px] border border-dashed border-[#ccbfe0] bg-white px-5 py-12 text-center"><h2 className="text-xl font-bold text-[#312738]">Create a project to begin</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71677a]">Your knowledge base belongs to a project. Create one from Generate, then return here to add trusted material.</p></section>
}

import { BookOpen, CheckCircle2, FolderKanban } from "lucide-react";

export function KnowledgeHero({ projects, projectId, onProjectChange, sourceCount, readyCount, disabled }) {
  return (
    <header className="overflow-hidden rounded-[28px] border border-[#ded7e3] bg-white shadow-[0_18px_50px_rgba(70,48,96,0.08)]">
      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-14 -top-20 size-56 rounded-full border-[28px] border-[#f1eaf8]" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eee7f6] text-[#4f378a] shadow-sm">
              <BookOpen className="size-5" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#70579e]">Project intelligence</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight text-[#211b26] sm:text-5xl">Knowledge base</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#625b71] sm:text-base">
              Keep every strategy grounded in trusted material from your brand.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-[#e4dcea] bg-[#fdfaff] p-4 lg:w-[300px]">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#766b7e]">
              <FolderKanban className="size-3.5 text-[#4f378a]" />
              Working project
            </label>
            <select
              value={projectId}
              onChange={(event) => onProjectChange(event.target.value)}
              disabled={disabled}
              className="mt-2 min-h-11 w-full rounded-xl border border-[#d7cce0] bg-white px-3 text-sm font-semibold text-[#2b2431] outline-none transition focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/15 disabled:cursor-not-allowed disabled:bg-[#f5f1f7] disabled:text-[#8a7f90]"
            >
              <option value="">Choose a project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            {projectId ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[#71677a]">
                <CheckCircle2 className="size-3.5 text-[#4f378a]" />
                {sourceCount} {sourceCount === 1 ? "source" : "sources"} · {readyCount} ready
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

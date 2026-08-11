import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import {
  DEFAULT_PROJECT_ICON_ID,
  PROJECT_COLORS,
  PROJECT_ICONS,
  ProjectIcon,
} from '@/lib/projectAppearance'

// Mounted fresh every time the modal opens, so the picker state always starts
// from the project being edited without an effect resetting it.
function ProjectAppearanceForm({ project, defaultName, onClose, onSubmit }) {
  const isEdit = Boolean(project)
  const [name, setName] = useState(project?.name ?? defaultName ?? '')
  const [iconId, setIconId] = useState(project?.iconId ?? DEFAULT_PROJECT_ICON_ID)
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[0])
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  const trimmedName = name.trim()

  const submit = async (event) => {
    event.preventDefault()
    if (!trimmedName || saving) return
    setSaving(true)
    const saved = await onSubmit({ name: trimmedName, iconId, color })
    if (saved === false) {
      setSaving(false)
      nameRef.current?.focus()
      return
    }
    onClose()
  }

  return (
    <motion.form
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit project' : 'New project'}
      onSubmit={submit}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.99 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full max-w-[440px] overflow-hidden rounded-[24px] border border-[#ece8ef] bg-white shadow-[0_30px_90px_rgba(31,20,40,0.28)]"
    >
      <div className="flex items-start justify-between gap-3 px-6 pt-5">
        <div>
          <h2 className="text-[17px] font-semibold text-[#201a25]">{isEdit ? 'Edit project' : 'New project'}</h2>
          <p className="mt-0.5 text-[13px] text-[#8b8494]">Give it a name, an icon, and a colour.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-[#8b8494] transition-colors hover:bg-[#f4f2f7] hover:text-[#201a25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <ProjectIcon iconId={iconId} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor="project-name" className="sr-only">Project name</label>
          <input
            id="project-name"
            ref={nameRef}
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            maxLength={80}
            placeholder="Project name"
            className="h-11 w-full rounded-xl border border-[#e2dee8] bg-white px-3 text-[14px] font-medium text-[#201a25] outline-none transition-shadow placeholder:text-[#b0aab9] focus:border-[#a58fcd] focus:ring-2 focus:ring-[#ece4f5]"
          />
        </div>
      </div>

      <fieldset className="mt-5 px-6">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a94a3]">Icon</legend>
        <div className="grid grid-cols-8 gap-1">
          {PROJECT_ICONS.map(({ id, label, Icon }) => {
            const selected = id === iconId
            return (
              <button
                key={id}
                type="button"
                onClick={() => setIconId(id)}
                aria-label={label}
                aria-pressed={selected}
                title={label}
                className={`flex aspect-square items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${selected ? '' : 'text-[#6b6577] hover:bg-[#f4f2f7]'}`}
                style={selected ? { backgroundColor: `${color}1f`, color } : undefined}
              >
                <Icon className="size-[18px]" />
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5 px-6">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a94a3]">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((swatch) => {
            const selected = swatch === color
            return (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-label={`Colour ${swatch}`}
                aria-pressed={selected}
                className={`flex size-7 items-center justify-center rounded-full text-white transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 ${selected ? 'ring-2 ring-[#201a25] ring-offset-2' : ''}`}
                style={{ backgroundColor: swatch }}
              >
                {selected ? <Check className="size-3.5" /> : null}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#f0eef2] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 items-center rounded-xl px-4 text-[13px] font-semibold text-[#4a4453] transition-colors hover:bg-[#f4f2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!trimmedName || saving}
          className="flex h-10 items-center rounded-xl bg-[#4f378a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#432e75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
        </button>
      </div>
    </motion.form>
  )
}

export default function ProjectAppearanceModal({ open, project, defaultName, onClose, onSubmit }) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-[#211928]/55 p-3 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <ProjectAppearanceForm
            project={project}
            defaultName={defaultName}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

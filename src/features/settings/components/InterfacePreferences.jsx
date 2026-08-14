import { motion } from 'framer-motion'
import { Check, Palette, Square, Type } from 'lucide-react'

const textSizeOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'large', label: 'Large' },
]

const accentPresets = [
  { color: '#4f378a', label: 'Aether violet' },
  { color: '#2563eb', label: 'Electric blue' },
  { color: '#0f766e', label: 'Ocean teal' },
  { color: '#15803d', label: 'Forest green' },
  { color: '#c2410c', label: 'Ember orange' },
  { color: '#be185d', label: 'Orchid pink' },
]

const cornerStyleOptions = [
  { value: 'none', label: 'None', radius: '0px' },
  { value: 'soft', label: 'Soft', radius: '7px' },
  { value: 'rounded', label: 'Rounded', radius: '14px' },
]

function PreferenceCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0e9f4] text-[#5d4772]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#362d3b]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#766b7b]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SegmentedPreference({ label, layoutId, options, value, onChange }) {
  return (
    <div
      className="mt-4 inline-flex max-w-full overflow-hidden rounded-xl border border-[#ded5e2] bg-[#faf7fb] p-1"
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`relative min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] focus-visible:ring-inset sm:px-4 ${selected ? 'text-[var(--aether-on-accent)]' : 'text-[#766b7b] hover:text-[#362d3b]'}`}
          >
            {selected ? (
              <motion.span
                layoutId={layoutId}
                className="pointer-events-none absolute inset-0 rounded-lg bg-[var(--aether-accent)] ring-1 ring-inset ring-white/20"
                style={{ boxShadow: '0 5px 14px color-mix(in srgb, var(--aether-accent) 30%, transparent)' }}
                transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.72 }}
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function InterfacePreferences({ preferences, onChange }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: preferences.accentColor }}>
            <Palette className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#362d3b]">Accent color</p>
            <p className="mt-1 text-xs leading-5 text-[#766b7b]">Tint backgrounds, surfaces, buttons, links, and focus states.</p>
          </div>
          <code className="hidden rounded-lg bg-[#f4eef6] px-2 py-1 text-[11px] font-semibold uppercase text-[#6e6374] sm:block">
            {preferences.accentColor}
          </code>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {accentPresets.map(({ color, label }) => {
            const selected = preferences.accentColor === color
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ accentColor: color })}
                className="relative flex size-10 items-center justify-center rounded-full border-2 border-white shadow-[0_0_0_1px_#d9cfe1] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] focus-visible:ring-offset-2"
                style={{ backgroundColor: color }}
                aria-label={`Use ${label}`}
                aria-pressed={selected}
                title={label}
              >
                {selected ? <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} /> : null}
              </button>
            )
          })}
          <label className="group relative flex h-10 min-w-10 cursor-pointer items-center gap-2 rounded-full border border-[#d9cfe1] bg-[#faf7fb] pr-3 text-xs font-semibold text-[#5f5565] transition hover:border-[#bbaac7] hover:bg-white focus-within:ring-2 focus-within:ring-[#675094] focus-within:ring-offset-2">
            <span className="ml-1 flex size-8 items-center justify-center rounded-full border-2 border-white shadow-sm" style={{ background: 'conic-gradient(from 90deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ef4444)' }}>
              <Palette className="size-3.5 text-white drop-shadow" />
            </span>
            Custom
            <input type="color" value={preferences.accentColor} onChange={(event) => onChange({ accentColor: event.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Choose a custom accent color" />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PreferenceCard icon={Type} title="Text size" description="Scale the interface text to your comfort.">
          <SegmentedPreference label="Text size" layoutId="settings-text-size-pill" options={textSizeOptions} value={preferences.textSize} onChange={(textSize) => onChange({ textSize })} />
        </PreferenceCard>

        <PreferenceCard icon={Square} title="Corner style" description="Choose how sharp or rounded cards, fields, and buttons feel.">
          <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Corner style">
            {cornerStyleOptions.map((option) => {
              const selected = preferences.cornerStyle === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  data-selected={selected}
                  onClick={() => onChange({ cornerStyle: option.value })}
                  className={`settings-corner-option flex min-h-[68px] flex-col items-center justify-center gap-2 border px-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] ${selected ? 'border-[#4f378a] text-[#4f378a]' : 'border-[#ded5e2] bg-[#faf7fb] text-[#766b7b] hover:border-[#bbaac7] hover:bg-white'}`}
                  style={{ borderRadius: option.radius }}
                >
                  <span className="block h-4 w-7 border-2 border-current" style={{ borderRadius: option.radius }} aria-hidden="true" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </PreferenceCard>
      </div>

    </div>
  )
}

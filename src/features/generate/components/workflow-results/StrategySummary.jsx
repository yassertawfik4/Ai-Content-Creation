import { Lightbulb } from 'lucide-react'
import { PlatformLogo, getPlatformBrandColor, hasPlatformLogo } from '@/lib/platformBrands'
import { PLATFORM_OPTIONS } from '../../schema/campaignSchema'

export function StrategySummary({ strategy }) {
  if (!strategy) return null
  const tones = strategy.tonePerPlatform ? Object.entries(strategy.tonePerPlatform) : []

  return (
    <section id="campaign-strategy" className="overflow-hidden rounded-[24px] border border-[#e6dee8] bg-[#fffaff] shadow-[0_14px_35px_rgba(46,32,51,0.05)]">
      <div className="px-6 pt-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e6fbc7] text-[#315016]">
            <Lightbulb className="size-[17px]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8090]">Campaign strategy</p>
            <h3 className="font-display text-[21px] leading-tight tracking-[-0.35px] text-[#201a25]">The idea behind the work</h3>
          </div>
        </div>
        <p className="mt-5 font-display text-[21px] leading-[1.5] tracking-[-0.2px] text-[#34283a] sm:text-[23px]">
          {strategy.coreNarrative}
        </p>
      </div>

      {Array.isArray(strategy.contentPillars) && strategy.contentPillars.length > 0 ? (
        <div className="mt-7 border-t border-[#efe9f0] px-6 py-6 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Content pillars</h4>
          <ol className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {strategy.contentPillars.map((pillar, index) => (
              <li key={`${pillar.name}-${index}`} className="flex gap-3">
                <span className="pt-px text-[12px] font-semibold tabular-nums text-[#b3a6bb]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-snug text-[#201a25]">{pillar.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-[#6f6475]">{pillar.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {tones.length > 0 ? (
        <div className="border-t border-[#efe9f0] px-6 py-6 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Voice by channel</h4>
          <dl className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {tones.map(([platform, tone]) => {
              const label = PLATFORM_OPTIONS.find((option) => option.id === platform)?.label ?? platform
              const brand = getPlatformBrandColor(platform)
              return (
                <div key={platform} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-px flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold uppercase"
                    style={{ backgroundColor: `${brand}14`, color: brand }}
                  >
                    {hasPlatformLogo(platform)
                      ? <PlatformLogo platform={platform} className="size-[15px]" />
                      : label.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[13px] font-semibold leading-snug text-[#201a25]">{label}</dt>
                    <dd className="mt-0.5 text-[13px] leading-[1.6] text-[#6f6475]">{tone}</dd>
                  </div>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}

      {strategy.rationale ? (
        <div className="border-t border-[#efe9f0] bg-[#faf7fb] px-6 py-5 sm:px-8">
          <h4 className="text-sm font-semibold text-[#201a25]">Why this works</h4>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-[#6f6475]">{strategy.rationale}</p>
        </div>
      ) : null}
    </section>
  )
}


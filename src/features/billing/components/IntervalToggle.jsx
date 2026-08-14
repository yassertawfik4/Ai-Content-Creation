/**
 * Monthly/yearly switch. The saving is derived from the catalog rather than the
 * hardcoded "Save 17%" that used to appear in two places and could not follow a
 * repricing.
 */
export function IntervalToggle({ interval, onChange, savingPercent }) {
  return (
    <div className="flex items-center gap-3">
      {['month', 'year'].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={interval === value}
          className={`flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] ${
            interval === value
              ? 'bg-[#381e72] text-white shadow-[0_8px_18px_rgba(56,30,114,0.22)]'
              : 'border border-[#d8cfdc] bg-white text-[#625b71] hover:border-[#a99eb4] hover:text-[#201a25]'
          }`}
        >
          {value === 'month' ? 'Monthly' : 'Yearly'}
          {value === 'year' && savingPercent > 0 ? (
            <span className={interval === 'year' ? 'text-[#b7f36b]' : 'text-[#6a9f27]'}>
              Save {savingPercent}%
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

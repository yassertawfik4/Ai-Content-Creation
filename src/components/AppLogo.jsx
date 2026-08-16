import brandMark from '@/assets/auth/brand-mark.svg'

const logoSizes = {
  sm: ['size-8 rounded-[10px]', 'size-4'],
  md: ['size-9 rounded-[11px]', 'size-[18px]'],
  lg: ['size-10 rounded-[13px]', 'size-5'],
}

export function AppLogo({ size = 'md', className = '' }) {
  const [containerSize, markSize] = logoSizes[size] ?? logoSizes.md

  return (
    <span
      className={`app-logo relative inline-flex shrink-0 items-center justify-center overflow-hidden ${containerSize} ${className}`}
      aria-hidden="true"
    >
      <span className="app-logo-glow absolute -right-[18%] -top-[28%] size-[70%] rounded-full" />
      <span
        className={`app-logo-mark relative ${markSize}`}
        style={{
          WebkitMaskImage: `url(${brandMark})`,
          maskImage: `url(${brandMark})`,
        }}
      />
    </span>
  )
}

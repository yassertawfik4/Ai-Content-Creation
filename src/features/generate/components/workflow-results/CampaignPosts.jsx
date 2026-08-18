import { useState } from 'react'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Hash, ImageOff, MousePointerClick, Sparkles } from 'lucide-react'
import { PLATFORM_OPTIONS } from '../../schema/campaignSchema'
import { ART_GRADIENTS, PLATFORM_ICONS } from '../../model/generateConfig'

const RENDERABLE_IMAGE_URL = /^(https?:|data:image\/|blob:)/i

function getRenderableImages(imageUrl, imageUrls) {
  const primaryImages = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  const additionalImages = Array.isArray(imageUrls) ? imageUrls : []
  const candidates = [...new Set([...primaryImages, ...additionalImages])]

  return candidates
    .filter((source) => typeof source === 'string' && RENDERABLE_IMAGE_URL.test(source))
    .slice(0, 2)
}

function PostArtwork({ gradient, imageUrl, imageUrls, label, brandName, platform }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const renderableImages = getRenderableImages(imageUrl, imageUrls)
  const hasImages = renderableImages.length > 0
  const hasImagePair = renderableImages.length === 2
  const visibleImageIndex = hasImagePair
    ? Math.min(activeImageIndex, renderableImages.length - 1)
    : 0

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + renderableImages.length) % renderableImages.length)
  }

  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % renderableImages.length)
  }

  const handleCarouselKeyDown = (event) => {
    if (!hasImagePair) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPreviousImage()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNextImage()
    }
  }

  return (
    <div
      role={hasImagePair ? 'region' : 'img'}
      aria-roledescription={hasImagePair ? 'carousel' : undefined}
      aria-label={label}
      tabIndex={hasImagePair ? 0 : undefined}
      onKeyDown={handleCarouselKeyDown}
      className={`group/artwork relative aspect-[4/3] min-h-60 overflow-hidden rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-[#4f378a]/50 focus-visible:ring-offset-2 ${hasImages ? 'bg-[#ded6df]' : `bg-gradient-to-br ${gradient}`}`}
    >
      {hasImages ? (
        <div className="absolute inset-0">
          {renderableImages.map((source, imageIndex) => (
            <div
              key={`${source.slice(0, 80)}-${imageIndex}`}
              aria-hidden={imageIndex !== visibleImageIndex}
              className={`absolute inset-0 overflow-hidden transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                imageIndex === visibleImageIndex
                  ? 'translate-x-0 opacity-100'
                  : imageIndex < visibleImageIndex
                    ? '-translate-x-[8%] opacity-0'
                    : 'translate-x-[8%] opacity-0'
              }`}
            >
              <img
                src={source}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
      <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full border border-white/35 bg-white/10" />
      <div className="pointer-events-none absolute bottom-[-52px] left-[-38px] size-44 rounded-full bg-[#201a25]/20 blur-sm" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#17111c]/70 via-[#17111c]/24 to-transparent" />

      {hasImagePair ? (
        <>
          <button
            type="button"
            onClick={showPreviousImage}
            aria-label="Show previous campaign image"
            className="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-[#17111c]/35 text-white shadow-[0_8px_24px_rgba(23,17,28,0.22)] backdrop-blur-md transition hover:scale-105 hover:bg-[#17111c]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={showNextImage}
            aria-label="Show next campaign image"
            className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-[#17111c]/35 text-white shadow-[0_8px_24px_rgba(23,17,28,0.22)] backdrop-blur-md transition hover:scale-105 hover:bg-[#17111c]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <div
            aria-live="polite"
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/35 bg-[#17111c]/32 px-2.5 py-2 shadow-sm backdrop-blur-md"
          >
            {renderableImages.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${dotIndex === visibleImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`}
              />
            ))}
            <span className="sr-only">Image {visibleImageIndex + 1} of {renderableImages.length}</span>
          </div>
        </>
      ) : null}

      <div className="absolute inset-x-5 bottom-5 z-10 flex items-end justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            {platform}
          </span>
          <span className="font-display text-[28px] leading-none tracking-tight text-white drop-shadow-sm">
            {brandName || 'Your brand'}
          </span>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-[#201a25]/15 backdrop-blur-md">
          <Sparkles className="size-[18px] text-white" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

export function PostCard({ post, index, showImage, brandName, onCaptionChange }) {
  const [copied, setCopied] = useState(false)
  const [draftCaption, setDraftCaption] = useState(post.caption ?? '')
  const platformLabel = PLATFORM_OPTIONS.find((option) => option.id === post.platform)?.label ?? post.platform
  const Icon = PLATFORM_ICONS[post.platform]
  const gradient = ART_GRADIENTS[index % ART_GRADIENTS.length]
  const hasRenderableImage = getRenderableImages(post.imageUrl, post.imageUrls).length > 0
  const renderArtwork = showImage && hasRenderableImage

  const copyPost = async () => {
    const value = [draftCaption, post.hashtags?.length ? post.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ') : '', post.cta]
      .filter(Boolean)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard access can be unavailable in embedded previews.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#d8cedc] bg-[#fffaff] shadow-[0_12px_32px_rgba(46,32,51,0.06)] transition-shadow duration-200 hover:shadow-[0_18px_42px_rgba(46,32,51,0.09)]">
      <header className="flex min-h-16 items-center gap-3 border-b border-[#e5dee7] px-4 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e6fbc7] text-xs font-bold tabular-nums text-[#315016]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#716777]">
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {platformLabel}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#807586]">
            <CalendarDays className="size-3.5" aria-hidden="true" /> {post.date || 'Schedule pending'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#f3f9e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#456321] sm:flex">
            <span className="size-1.5 rounded-full bg-[#6d9d2d]" /> Ready
          </span>
          <button
            type="button"
            onClick={copyPost}
            aria-label={`Copy post ${index + 1}`}
            className="flex h-11 items-center gap-2 rounded-xl border border-[#ded4e2] bg-white px-3.5 text-xs font-semibold text-[#554c5b] transition-colors hover:border-[#bbaac5] hover:bg-[#f8f3f8] hover:text-[#381e72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            <span>{copied ? 'Copied' : 'Copy post'}</span>
          </button>
        </div>
      </header>

      <div className={`grid gap-1 p-4 sm:p-5 ${renderArtwork ? 'md:grid-cols-[minmax(260px,0.76fr)_minmax(0,1.24fr)] md:gap-5' : ''}`}>
        {renderArtwork ? (
          <PostArtwork
            gradient={gradient}
            imageUrl={post.imageUrl}
            imageUrls={post.imageUrls}
            label={post.visualPrompt || `Campaign visual for ${brandName}`}
            brandName={brandName}
            platform={platformLabel}
          />
        ) : null}
        <div className={`${renderArtwork ? 'pt-5 md:pt-1' : ''} min-w-0`}>
          {showImage && !hasRenderableImage ? (
            <div role="status" className="mb-4 flex items-start gap-3 rounded-2xl border border-[#ead9bd] bg-[#fff9ed] px-3.5 py-3 text-[#725526]">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#9a6b22] shadow-sm">
                <ImageOff className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold">Image unavailable · post copy is ready</p>
                <p className="mt-0.5 text-[11px] leading-5 text-[#8b6b38]">{post.imageError || 'The visual could not be generated, but this post is complete and ready to review.'}</p>
              </div>
            </div>
          ) : null}
          <div className="mb-2.5 flex items-end justify-between gap-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#746a7a]" htmlFor={`post-caption-${index}`}>
              Caption
            </label>
            <span id={`post-caption-count-${index}`} className="text-[11px] tabular-nums text-[#8a7f90]">{draftCaption.length} characters</span>
          </div>
          <textarea
            id={`post-caption-${index}`}
            rows={3}
            value={draftCaption}
            onChange={(event) => setDraftCaption(event.target.value)}
            onBlur={() => onCaptionChange(index, draftCaption)}
            aria-describedby={`post-caption-count-${index} post-caption-help-${index}`}
            className="scrollbar-hidden min-h-28 max-h-[34rem] w-full resize-y overflow-y-auto rounded-2xl border border-[#ddd3e1] bg-[#fbf8fb] px-4 py-3.5 text-base leading-7 text-[#423a47] outline-none transition-colors placeholder:text-[#aaa1ae] focus:border-[#6b4c9a] focus:bg-white focus:ring-3 focus:ring-[#4f378a]/10 sm:text-[15px]"
          />
          <p id={`post-caption-help-${index}`} className="mt-1.5 text-[11px] text-[#8a7f90]">Your edit saves when you leave this field.</p>

          {post.hashtags?.length ? (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#817686]"><Hash className="size-3.5" aria-hidden="true" /> Hashtags</p>
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`Hashtags for post ${index + 1}`}>
                {post.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#ded4e2] bg-white px-2.5 py-1 text-[11px] font-medium text-[#4f378a]">#{tag.replace(/^#/, '')}</span>
                ))}
              </div>
            </div>
          ) : null}

          {post.cta ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e3d9e6] bg-[#f3edf5] p-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4f378a] shadow-sm"><MousePointerClick className="size-4" aria-hidden="true" /></span>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#817686]">Call to action</p><p className="mt-1 text-sm font-semibold text-[#4f378a]">{post.cta}</p></div>
            </div>
          ) : null}

          {showImage && post.visualPrompt ? (
            <details className="group mt-4 rounded-xl border border-[#e6dee8] bg-white">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold text-[#62566b] transition-colors hover:bg-[#faf7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] [&::-webkit-details-marker]:hidden">
                View visual direction
                <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="border-t border-[#ece4ee] px-3.5 py-3 text-xs leading-5 text-[#7b7081]">{post.visualPrompt}</p>
            </details>
          ) : null}
        </div>
      </div>
    </article>
  )
}

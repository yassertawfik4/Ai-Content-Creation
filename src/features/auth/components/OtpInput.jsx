import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const cellClassName =
  'flex h-[52px] w-full max-w-[64px] items-center justify-center rounded-xl border bg-white text-center text-2xl font-semibold text-[#1d1b20] caret-[#4f378a] outline-none transition-all duration-200 placeholder:text-transparent focus:border-[#4f378a] focus:ring-4 focus:ring-[#4f378a]/15 disabled:cursor-not-allowed disabled:opacity-40 sm:h-[60px] sm:max-w-[68px] sm:text-[28px]'

function OtpInput({
  value = '',
  length = 6,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
  labelledBy,
  describedBy,
}) {
  const refs = useRef([])

  const normalized = String(value).slice(0, length)

  const focusIndex = (index) => {
    const input = refs.current[index]
    if (input) {
      input.focus()
      input.setSelectionRange(0, 1)
    }
  }

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index, event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, length)
    if (!digits) {
      onChange(normalized.slice(0, index) + normalized.slice(index + 1))
      return
    }
    const chars = normalized.split('')
    for (let i = 0; i < digits.length && index + i < length; i++) {
      chars[index + i] = digits[i]
    }
    const next = chars.join('').slice(0, length)
    onChange(next)
    focusIndex(Math.min(index + digits.length, length - 1))
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (normalized[index]) {
        const chars = normalized.split('')
        chars[index] = ''
        onChange(chars.join(''))
      } else if (index > 0) {
        const chars = normalized.split('')
        chars[index - 1] = ''
        onChange(chars.join(''))
        focusIndex(index - 1)
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusIndex(index + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusIndex(length - 1)
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text')
    const digits = text.replace(/\D/g, '').slice(0, length)
    if (!digits) return
    onChange(digits)
    focusIndex(Math.min(digits.length, length - 1))
  }

  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : 'Verification code'}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn('-mx-1 flex justify-between gap-2 px-1 sm:gap-3', error && 'auth-shake', className)}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={length}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={error || undefined}
          value={normalized[index] ?? ''}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.setSelectionRange(0, 1)}
          className={cn(
            cellClassName,
            !error && normalized[index] && 'border-[#4f378a] bg-[#f5f1ff] shadow-[0_0_0_4px_rgba(79,55,138,0.08)]',
            error && 'border-[#d24a4a] bg-[#fff7f7] focus:border-[#d24a4a] focus:ring-[#d24a4a]/15',
          )}
        />
      ))}
    </div>
  )
}

export { OtpInput }

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Check, LoaderCircle, MailCheck, PenLine, RefreshCw, Send } from 'lucide-react'
import { OtpInput } from '../components/OtpInput'
import { getErrorMessage, sendVerificationOtp, verifyEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { maskEmail } from '@/lib/maskEmail'

const RESEND_COOLDOWN_SECONDS = 60
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const inputClassName =
  'h-[52px] rounded-xl border border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] outline-none transition placeholder:text-[#8f8794] focus-visible:border-[#4f378a] focus-visible:ring-4 focus-visible:ring-[#4f378a]/12 disabled:cursor-not-allowed disabled:opacity-60'

const primaryButtonClassName =
  'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] text-sm font-semibold tracking-[1.4px] text-white shadow-[0_10px_24px_rgba(79,55,138,0.2)] transition-[background-color,box-shadow,opacity] duration-200 hover:bg-[#432f75] hover:shadow-[0_12px_28px_rgba(79,55,138,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9886bc] disabled:shadow-[0_8px_18px_rgba(79,55,138,0.14)]'

const labelClassName = 'text-sm font-medium tracking-[1.4px] text-[#494551]'

function VerifyEmailShell({ children }) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[#fef7ff] px-4 py-8 text-[#1d1b20] sm:px-6 sm:py-10">
      <section className="w-full max-w-[452px]">{children}</section>
    </main>
  )
}

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const initialEmail = typeof location.state?.email === 'string' ? location.state.email.trim() : ''
  const [email, setEmail] = useState(initialEmail)
  const [emailDraft, setEmailDraft] = useState(initialEmail)
  const [hasSentCode, setHasSentCode] = useState(Boolean(initialEmail))
  const [editingEmail, setEditingEmail] = useState(!initialEmail)
  const [otp, setOtp] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('idle')
  const countdown = useCountdown(0)

  const isSending = status === 'sending'
  const isVerifying = status === 'verifying'
  const isResending = status === 'resending'
  const isBusy = isSending || isVerifying || isResending

  const startResendCooldown = () => countdown.restart(RESEND_COOLDOWN_SECONDS)
  const startResendCooldownRef = useRef(startResendCooldown)

  useEffect(() => {
    startResendCooldownRef.current = startResendCooldown
  })

  const autoSent = useRef(false)

  useEffect(() => {
    const trimmed = email.trim()
    if (!trimmed || autoSent.current) return undefined
    autoSent.current = true
    setStatus('resending')
    sendVerificationOtp({ email: trimmed, type: 'email-verification' })
      .then(() => {
        setNotice('A new verification code was sent to your inbox.')
        startResendCooldownRef.current()
      })
      .catch((err) => {
        setFormError(getErrorMessage(err))
      })
      .finally(() => setStatus('idle'))
    return undefined
  }, [email])

  const handleSendToEmail = async (event) => {
    event.preventDefault()
    const trimmed = emailDraft.trim()

    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError('Enter a valid email address so we can send your verification code.')
      return
    }

    setEmailError('')
    setFormError('')
    setNotice('')
    setStatus('sending')
    try {
      await sendVerificationOtp({ email: trimmed, type: 'email-verification' })
      setEmail(trimmed)
      setEmailDraft(trimmed)
      setHasSentCode(true)
      setEditingEmail(false)
      setOtp('')
      setNotice('A new verification code was sent to your inbox.')
      startResendCooldown()
    } catch (error) {
      setEmailError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setEditingEmail(true)
      setEmailError('Enter a valid email address to verify this account.')
      return
    }
    if (otp.length !== 6) {
      setFormError('Enter all six digits from your verification email.')
      return
    }

    setFormError('')
    setNotice('')
    setStatus('verifying')
    try {
      await verifyEmailOtp({ email, otp })
      await refreshSession()
      setStatus('success')
    } catch (error) {
      setFormError(getErrorMessage(error))
      setStatus('idle')
    }
  }

  const handleResend = async () => {
    if (!EMAIL_PATTERN.test(email) || countdown.isRunning || isBusy) return

    setFormError('')
    setNotice('')
    setStatus('resending')
    try {
      await sendVerificationOtp({ email, type: 'email-verification' })
      setOtp('')
      setNotice('A fresh code is on its way. Check your inbox and spam folder.')
      startResendCooldown()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  const beginEmailChange = () => {
    setEmailDraft(email)
    setEditingEmail(true)
    setEmailError('')
    setFormError('')
    setNotice('')
  }

  const cancelEmailChange = () => {
    setEmailDraft(email)
    setEditingEmail(false)
    setEmailError('')
  }

  useEffect(() => {
    if (status !== 'success') return undefined
    const timer = setTimeout(() => {
      const from = location.state?.from
      navigate(typeof from === 'string' ? from : '/generate', { replace: true })
    }, 1400)
    return () => clearTimeout(timer)
  }, [status, location.state?.from, navigate])

  const formatCountdown = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  if (status === 'success') {
    return (
      <VerifyEmailShell>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="auth-pop mb-6 flex size-20 items-center justify-center rounded-full bg-[#e6f3e1] shadow-[0_0_0_10px_rgba(58,130,74,0.08)]">
            <Check className="size-9 text-[#2e6b3e]" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <h1 className="auth-fade-up font-display text-[38px] leading-[1.1] tracking-[-1px]">
            Email verified
          </h1>
          <p className="auth-fade-up auth-fade-up-delay mt-3 text-sm leading-6 text-[#494551]" role="status">
            Your address is confirmed — opening your workspace…
          </p>
        </div>
      </VerifyEmailShell>
    )
  }

  return (
    <VerifyEmailShell>
      <div className="auth-rise flex flex-col">
        <header className="flex flex-col gap-1">
          <span className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-[#ede7f7]">
            <MailCheck className="size-6 text-[#4f378a]" aria-hidden="true" />
          </span>
          <div className="pt-3 sm:pt-4">
            <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
              Verify your email
            </h1>
          </div>
          <p className="text-sm leading-5 text-[#494551] sm:max-w-[390px]">
            Enter the 6-digit code we sent to confirm your account and finish setting up your team.
          </p>
        </header>

        {editingEmail ? (
          <form className="auth-drop mt-7 rounded-2xl border border-[#d4ccd8] bg-white/65 p-4 shadow-[0_6px_18px_rgba(43,31,48,0.05)]" onSubmit={handleSendToEmail} noValidate>
            <label className={labelClassName} htmlFor="verify-email">
              Email address
            </label>
            <input
              id="verify-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="alex@company.com"
              value={emailDraft}
              onChange={(event) => {
                setEmailDraft(event.target.value)
                if (emailError) setEmailError('')
              }}
              disabled={isSending}
              className={`${inputClassName} mt-2 w-full`}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'verify-email-error' : 'verify-email-help'}
            />
            {emailError ? (
              <p id="verify-email-error" role="alert" className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#a42f42]">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {emailError}
              </p>
            ) : (
              <p id="verify-email-help" className="mt-2 text-xs leading-5 text-[#625b67]">
                We’ll send a fresh 6-digit code to this address.
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button type="submit" disabled={isSending} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#432f75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                {isSending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                {isSending ? 'Sending code…' : 'Send verification code'}
              </button>
              {hasSentCode ? (
                <button type="button" onClick={cancelEmailChange} disabled={isSending} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-[#4f378a] transition-colors hover:bg-[#ede7f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:opacity-60">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="mt-7 flex min-h-[66px] items-center gap-3 rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 shadow-[0_2px_5px_rgba(43,31,48,0.12)]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ede7f7]">
              <MailCheck className="size-5 text-[#4f378a]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#494551]">
                Verification sent to
              </p>
              <p className="truncate text-sm font-medium text-[#1d1b20]">{maskEmail(email)}</p>
            </div>
            <button
              type="button"
              onClick={beginEmailChange}
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#4f378a] transition-colors hover:bg-[#f1ecf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
            >
              <PenLine className="size-3.5" aria-hidden="true" />
              Change
            </button>
          </div>
        )}

        {hasSentCode && !editingEmail ? (
          <form className="mt-6 flex flex-col gap-5" onSubmit={handleVerify} noValidate>
            <div className="flex flex-col gap-3">
              <span className={labelClassName} id="verify-otp-label">
                Verification code
              </span>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value)
                  if (formError) setFormError('')
                  if (notice) setNotice('')
                }}
                autoFocus
                disabled={isBusy}
                error={Boolean(formError)}
                labelledBy="verify-otp-label"
                describedBy={formError ? 'verify-form-error' : 'verify-otp-help'}
              />
              {formError ? (
                <p id="verify-form-error" role="alert" className="auth-drop flex items-start gap-2 text-sm leading-5 text-[#a42f42]">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </p>
              ) : (
                <p id="verify-otp-help" className="text-xs leading-5 text-[#494551]">
                  {otp.length}/6 digits entered
                </p>
              )}
            </div>

            {notice ? (
              <p role="status" aria-live="polite" className="auth-drop rounded-lg bg-[#eaf3e6] px-3 py-2.5 text-sm leading-5 text-[#2e6b3e]">
                {notice}
              </p>
            ) : null}

            <button type="submit" disabled={otp.length !== 6 || isBusy} className={primaryButtonClassName}>
              {isVerifying ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                'Verify email'
              )}
            </button>

            <div className="flex min-h-11 items-center justify-center text-sm leading-5 text-[#494551]">
              {countdown.isRunning ? (
                <span className="flex items-center gap-2 tabular-nums">
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Resend available in {formatCountdown(countdown.seconds)}
                </span>
              ) : (
                <button type="button" onClick={handleResend} disabled={isBusy} className="min-h-11 rounded-lg px-3 font-semibold text-[#4f378a] underline-offset-4 transition-colors hover:bg-[#f1ecf8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] disabled:cursor-not-allowed disabled:opacity-60">
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </span>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
              )}
            </div>
          </form>
        ) : null}

        <p className="mt-1 text-center text-sm leading-5 text-[#494551]">
          <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-[#4f378a] underline-offset-4 transition-colors hover:bg-[#f1ecf8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
            Back to login
          </Link>
        </p>
      </div>
    </VerifyEmailShell>
  )
}

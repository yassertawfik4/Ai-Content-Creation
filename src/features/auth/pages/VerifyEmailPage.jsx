import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, LoaderCircle, MailCheck, PenLine, RefreshCw } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { OtpInput } from '../components/OtpInput'
import { getErrorMessage, sendVerificationOtp, verifyEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { maskEmail } from '@/lib/maskEmail'

const RESEND_COOLDOWN_SECONDS = 60

const inputClassName =
  'h-[50px] rounded-xl border border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] outline-none transition placeholder:text-[#a29ba8] focus-visible:border-[#4f378a] focus-visible:ring-2 focus-visible:ring-[#4f378a]/25 disabled:cursor-not-allowed disabled:opacity-60'

const primaryButtonClassName =
  'h-14 w-full gap-2 rounded-xl bg-[#4f378a] text-sm font-semibold tracking-[1.4px] text-white shadow-lg shadow-[#4f378a]/20 transition-colors hover:bg-[#432f75] disabled:cursor-not-allowed disabled:opacity-60'

const labelClassName = 'text-sm font-medium tracking-[1.4px] text-[#494551]'

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [editingEmail, setEditingEmail] = useState(!location.state?.email)
  const [otp, setOtp] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('idle')
  const countdown = useCountdown(0)

  const isSubmitting = status === 'verifying' || status === 'resending'

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

  const handleVerify = async (event) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setEditingEmail(true)
      setFormError('Enter a valid email to verify this account.')
      return
    }
    if (otp.length !== 6) return
    setFormError('')
    setNotice('')
    setStatus('verifying')
    try {
      await verifyEmailOtp({ email: trimmed, otp: otp.trim() })
      await refreshSession()
      setStatus('success')
    } catch (err) {
      setFormError(getErrorMessage(err))
      setStatus('idle')
    }
  }

  const handleResend = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setFormError('')
    setNotice('')
    setStatus('resending')
    try {
      await sendVerificationOtp({ email: trimmed, type: 'email-verification' })
      setNotice('A new verification code was sent to your inbox.')
      startResendCooldown()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setStatus('idle')
    }
  }

  useEffect(() => {
    if (status !== 'success') return undefined
    const timer = setTimeout(() => {
      const from = location.state?.from
      navigate(typeof from === 'string' ? from : '/', { replace: true })
    }, 1600)
    return () => clearTimeout(timer)
  }, [status, location.state?.from, navigate])

  const formatCountdown = (secs) =>
    `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  if (status === 'success') {
    return (
      <AuthShell>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="auth-pop mb-6 flex size-20 items-center justify-center rounded-full bg-[#e6f3e1] shadow-[0_0_0_10px_rgba(58,130,74,0.08)]">
            <Check className="size-9 text-[#2e6b3e]" strokeWidth={2.4} />
          </span>
          <h1 className="auth-fade-up font-display text-[38px] leading-[1.1] tracking-[-1px]">
            Email verified
          </h1>
          <p className="auth-fade-up auth-fade-up-delay mt-3 text-sm leading-6 text-[#494551]">
            Your address is confirmed — taking you to your workspace…
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="auth-rise flex flex-col">
        <div className="flex flex-col gap-1">
          <span className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-[#4f378a]/10">
            <MailCheck className="size-6 text-[#4f378a]" />
          </span>
          <div className="pt-3 sm:pt-4">
            <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
              Verify your email
            </h1>
          </div>
          <p className="text-sm leading-5 text-[#494551] sm:max-w-[380px]">
            Enter the 6-digit code we sent to confirm your account and finish setting up your team.
          </p>
        </div>

        {!editingEmail && email ? (
          <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 shadow-sm">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4f378a]/10">
              <MailCheck className="size-5 text-[#4f378a]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[1px] text-[#494551] uppercase">
                Verification sent to
              </p>
              <p className="truncate text-sm font-medium text-[#1d1b20]">{maskEmail(email)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingEmail(true)
                setFormError('')
              }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[#4f378a] underline-offset-4 hover:bg-[#4f378a]/5 hover:underline"
            >
              <PenLine className="size-3.5" />
              Change
            </button>
          </div>
        ) : null}

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleVerify} noValidate>
          {editingEmail ? (
            <div className="auth-drop flex flex-col gap-2">
              <label className={labelClassName} htmlFor="verify-email">
                Email address
              </label>
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (formError) setFormError('')
                }}
                disabled={false}
                className={inputClassName}
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? 'verify-form-error' : undefined}
              />
              {editingEmail && email ? (
                <button
                  type="button"
                  onClick={() => setEditingEmail(false)}
                  className="self-start text-xs font-medium text-[#494551] underline-offset-4 hover:text-[#4f378a] hover:underline"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <span className={labelClassName} id="verify-otp-label">
              Verification code
            </span>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value)
                if (formError) setFormError('')
              }}
              autoFocus={!editingEmail}
              disabled={isSubmitting}
              error={Boolean(formError)}
              describedBy={formError ? 'verify-form-error' : 'verify-otp-help'}
            />
            {formError ? (
              <p
                id="verify-form-error"
                role="alert"
                className="auth-drop text-sm leading-5 text-destructive"
              >
                {formError}
              </p>
            ) : (
              <p id="verify-otp-help" className="text-xs leading-5 text-[#494551]">
                {otp.length}/6 digits entered
              </p>
            )}
          </div>

          {notice ? (
            <p role="status" className="auth-drop text-sm leading-5 text-[#2e6b3e]">
              {notice}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={otp.length !== 6 || isSubmitting}
            className={primaryButtonClassName}
          >
            {status === 'verifying' ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Verifying…
              </>
            ) : (
              'Verify email'
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-sm leading-5 text-[#494551]">
            {countdown.isRunning ? (
              <span className="flex items-center gap-2 tabular-nums">
                <RefreshCw className="size-4 animate-spin-slow" />
                Resend in {formatCountdown(countdown.seconds)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting}
                className="font-semibold text-[#4f378a] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'resending' ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  'Resend verification email'
                )}
              </button>
            )}
          </div>

          <p className="text-center text-sm leading-5 text-[#494551]">
            <Link
              to="/login"
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}
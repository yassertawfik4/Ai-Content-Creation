import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { OtpInput } from '../components/OtpInput'
import {
  checkPasswordResetOtp,
  getErrorMessage,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from '@/lib/authApi'
import { maskEmail } from '@/lib/maskEmail'
import { useCountdown } from '@/hooks/useCountdown'
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
} from '../schema/authSchema'

const RESEND_COOLDOWN_SECONDS = 60

const inputClassName =
  'h-[52px] rounded-xl border border-[#cbc4d2] bg-white text-base text-[#1d1b20] shadow-none outline-none transition placeholder:text-[#918895] focus-visible:border-[#4f378a] focus-visible:ring-4 focus-visible:ring-[#4f378a]/12 disabled:cursor-not-allowed disabled:opacity-60'

const primaryButtonClassName =
  'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-5 text-sm font-semibold tracking-[1.2px] text-white shadow-[0_10px_24px_rgba(79,55,138,0.2)] transition-[background-color,box-shadow,opacity] hover:bg-[#432f75] hover:shadow-[0_12px_30px_rgba(79,55,138,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9988ba] disabled:shadow-none'

const labelClassName = 'text-sm font-medium tracking-[1.35px] text-[#494551]'

const RECOVERY_STEPS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'otp', label: 'Verify', icon: ShieldCheck },
  { id: 'password', label: 'Reset', icon: KeyRound },
]

const RECOVERY_COPY = {
  email: {
    eyebrow: 'Account recovery',
    title: 'Forgot your password?',
    description: 'Enter your account email and we’ll send a private 6-digit recovery code.',
  },
  otp: {
    eyebrow: 'Check your inbox',
    title: 'Prove it’s you.',
    description: 'Enter the code from your email. It expires in five minutes for your protection.',
  },
  password: {
    eyebrow: 'Final step',
    title: 'Create a new password.',
    description: 'Choose a fresh password for your account. Your other active sessions will be signed out.',
  },
}

function RecoveryProgress({ step }) {
  const activeIndex = RECOVERY_STEPS.findIndex((item) => item.id === step)

  return (
    <ol className="grid grid-cols-3" aria-label="Password recovery progress">
      {RECOVERY_STEPS.map((item, index) => {
        const Icon = item.icon
        const isComplete = index < activeIndex
        const isActive = index === activeIndex
        return (
          <li key={item.id} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
            {index > 0 ? (
              <span
                className={`absolute right-1/2 top-[17px] w-full border-t border-dashed ${
                  index <= activeIndex ? 'border-[#4f378a]' : 'border-[#cfc5d5]'
                }`}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`relative z-10 flex size-9 items-center justify-center rounded-full border transition-colors ${
                isComplete || isActive
                  ? 'border-[#4f378a] bg-[#4f378a] text-white'
                  : 'border-[#d4ccd8] bg-white text-[#817987]'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
            </span>
            <span className={`text-[11px] font-semibold tracking-[0.4px] ${isActive ? 'text-[#4f378a]' : 'text-[#746c78]'}`}>
              {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function RecoveryError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="auth-drop flex items-start gap-2 rounded-xl bg-[#fff0f2] px-3 py-2.5 text-sm leading-5 text-[#a42f42]">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

function PasswordField({
  id,
  label,
  error,
  registration,
  autoFocus = false,
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClassName} htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete="new-password"
          autoFocus={autoFocus}
          placeholder="At least 8 characters"
          className={`${inputClassName} w-full pl-4 pr-12`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute inset-y-0 right-3 flex w-8 items-center justify-center rounded-lg text-[#625b67] transition-colors hover:bg-[#f1ecf8] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {isVisible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
        </button>
      </div>
      {error ? <p id={`${id}-error`} className="text-xs text-[#a42f42]">{error.message}</p> : null}
    </div>
  )
}

function recoveryErrorMessage(error) {
  if (error?.code === 'OTP_EXPIRED') return 'That code has expired. Request a fresh code to continue.'
  if (error?.code === 'INVALID_OTP') return 'That code is not correct. Check the email and try again.'
  if (error?.code === 'TOO_MANY_ATTEMPTS') return 'Too many attempts. Request a new code and try again.'
  return getErrorMessage(error)
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [resetError, setResetError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('idle')
  const countdown = useCountdown(0)

  const emailForm = useForm({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  })
  const passwordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const passwordValue = useWatch({ control: passwordForm.control, name: 'password' }) ?? ''
  const confirmPasswordValue = useWatch({ control: passwordForm.control, name: 'confirmPassword' }) ?? ''
  const isBusy = status !== 'idle'
  const copy = RECOVERY_COPY[step]

  const handleEmailSubmit = emailForm.handleSubmit(async ({ email }) => {
    setRequestError('')
    setStatus('sending')
    try {
      await requestPasswordResetOtp({ email })
      setRecoveryEmail(email)
      setOtp('')
      setNotice('If an account matches this email, its recovery code is on the way.')
      countdown.restart(RESEND_COOLDOWN_SECONDS)
      setStep('otp')
    } catch (error) {
      setRequestError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  })

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    if (otp.length !== 6 || isBusy) return

    setOtpError('')
    setNotice('')
    setStatus('verifying')
    try {
      await checkPasswordResetOtp({ email: recoveryEmail, otp })
      setStep('password')
    } catch (error) {
      setOtpError(recoveryErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  const handleResend = async () => {
    if (countdown.isRunning || isBusy) return
    setOtpError('')
    setNotice('')
    setStatus('resending')
    try {
      await requestPasswordResetOtp({ email: recoveryEmail })
      setOtp('')
      setNotice('A fresh recovery code is on the way.')
      countdown.restart(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      setOtpError(getErrorMessage(error))
    } finally {
      setStatus('idle')
    }
  }

  const handlePasswordSubmit = passwordForm.handleSubmit(async ({ password }) => {
    setResetError('')
    setStatus('resetting')
    try {
      await resetPasswordWithOtp({ email: recoveryEmail, otp, password })
      setStep('success')
    } catch (error) {
      const message = recoveryErrorMessage(error)
      if (error?.code === 'OTP_EXPIRED' || error?.code === 'INVALID_OTP' || error?.code === 'TOO_MANY_ATTEMPTS') {
        setOtp('')
        setOtpError(message)
        setStep('otp')
      } else {
        setResetError(message)
      }
    } finally {
      setStatus('idle')
    }
  })

  useEffect(() => {
    if (step !== 'success') return undefined
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2200)
    return () => clearTimeout(timer)
  }, [navigate, step])

  const formatCountdown = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  if (step === 'success') {
    return (
      <AuthShell centered>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="auth-pop mb-6 flex size-20 items-center justify-center rounded-full bg-[#e6f3e1] shadow-[0_0_0_10px_rgba(58,130,74,0.08)]">
            <Check className="size-9 text-[#2e6b3e]" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#4f378a]">Password updated</p>
          <h1 className="auth-fade-up mt-3 font-display text-[38px] leading-[1.08] tracking-[-1px]">
            You’re back in control.
          </h1>
          <p className="auth-fade-up auth-fade-up-delay mt-3 max-w-[340px] text-sm leading-6 text-[#494551]" role="status">
            Your new password is ready. Taking you to the secure login screen…
          </p>
          <Link to="/login" replace className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#4f378a] transition-colors hover:bg-[#f1ecf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
            Log in now <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell centered>
      <div className="auth-rise flex flex-col">
        <RecoveryProgress step={step} />

        <header className="mt-7 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#4f378a]">{copy.eyebrow}</p>
          <h1 className="mt-2 font-display text-[36px] leading-[1.08] tracking-[-0.9px] sm:text-[42px] sm:tracking-[-1.05px]">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-[400px] text-sm leading-6 text-[#56505b]">{copy.description}</p>
        </header>

        {step === 'email' ? (
          <form className="mt-7 flex flex-col gap-5" onSubmit={handleEmailSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <label className={labelClassName} htmlFor="recovery-email">Account email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#f1ecf8] text-[#4f378a]" aria-hidden="true">
                  <Mail className="size-4" />
                </span>
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="alex@company.com"
                  className={`${inputClassName} w-full pl-12 pr-4`}
                  aria-invalid={Boolean(emailForm.formState.errors.email)}
                  aria-describedby={emailForm.formState.errors.email ? 'recovery-email-error' : 'recovery-email-help'}
                  {...emailForm.register('email')}
                />
              </div>
              {emailForm.formState.errors.email ? (
                <p id="recovery-email-error" className="text-xs text-[#a42f42]">{emailForm.formState.errors.email.message}</p>
              ) : (
                <p id="recovery-email-help" className="text-xs leading-5 text-[#6a626e]">
                  For privacy, we’ll show the same confirmation whether or not an account exists.
                </p>
              )}
            </div>

            <RecoveryError id="recovery-request-error" message={requestError} />

            <button type="submit" disabled={emailForm.formState.isSubmitting || isBusy} className={primaryButtonClassName}>
              {status === 'sending' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
              {status === 'sending' ? 'Sending secure code…' : 'Send recovery code'}
            </button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <div className="mt-7 flex flex-col">
            <div className="flex items-center gap-3 rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(43,31,48,0.06)]">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ede7f7]">
                <Mail className="size-5 text-[#4f378a]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#746c78]">Recovery code sent to</p>
                <p className="truncate text-sm font-medium text-[#1d1b20]">{maskEmail(recoveryEmail)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setOtpError('')
                  setNotice('')
                  emailForm.setValue('email', recoveryEmail)
                }}
                disabled={isBusy}
                className="min-h-10 rounded-lg px-2.5 text-xs font-semibold text-[#4f378a] hover:bg-[#f1ecf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]"
              >
                Change
              </button>
            </div>

            <form className="mt-6 flex flex-col gap-5" onSubmit={handleOtpSubmit} noValidate>
              <div className="flex flex-col gap-3">
                <span id="recovery-otp-label" className={labelClassName}>6-digit recovery code</span>
                <OtpInput
                  value={otp}
                  onChange={(value) => {
                    setOtp(value)
                    if (otpError) setOtpError('')
                    if (notice) setNotice('')
                  }}
                  disabled={isBusy}
                  error={Boolean(otpError)}
                  labelledBy="recovery-otp-label"
                  describedBy={otpError ? 'recovery-otp-error' : 'recovery-otp-help'}
                />
                {otpError ? (
                  <RecoveryError id="recovery-otp-error" message={otpError} />
                ) : (
                  <p id="recovery-otp-help" className="text-xs leading-5 text-[#6a626e]">{otp.length}/6 digits entered</p>
                )}
              </div>

              {notice ? <p role="status" aria-live="polite" className="rounded-xl bg-[#eaf3e6] px-3 py-2.5 text-sm leading-5 text-[#2e6b3e]">{notice}</p> : null}

              <button type="submit" disabled={otp.length !== 6 || isBusy} className={primaryButtonClassName}>
                {status === 'verifying' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
                {status === 'verifying' ? 'Checking code…' : 'Verify recovery code'}
              </button>
            </form>

            <div className="mt-4 flex min-h-11 items-center justify-center text-sm text-[#5f5864]">
              {countdown.isRunning ? (
                <span className="flex items-center gap-2 tabular-nums"><RefreshCw className="size-4" aria-hidden="true" />Resend available in {formatCountdown(countdown.seconds)}</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={isBusy} className="rounded-lg px-3 py-2 font-semibold text-[#4f378a] underline-offset-4 hover:bg-[#f1ecf8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
                  {status === 'resending' ? 'Sending…' : 'Resend recovery code'}
                </button>
              )}
            </div>
          </div>
        ) : null}

        {step === 'password' ? (
          <form className="mt-7 flex flex-col gap-5" onSubmit={handlePasswordSubmit} noValidate>
            <div className="rounded-xl border border-[#d8d0dc] bg-[#f6f1fb] px-4 py-3 text-xs leading-5 text-[#5e5662]">
              <span className="flex items-center gap-2 font-semibold text-[#41394a]"><LockKeyhole className="size-4 text-[#4f378a]" aria-hidden="true" />Code verified for {maskEmail(recoveryEmail)}</span>
            </div>

            <PasswordField id="new-recovery-password" label="New password" error={passwordForm.formState.errors.password} registration={passwordForm.register('password')} autoFocus />
            <PasswordField id="confirm-recovery-password" label="Confirm new password" error={passwordForm.formState.errors.confirmPassword} registration={passwordForm.register('confirmPassword')} />

            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 ${passwordValue.length >= 8 ? 'bg-[#eaf3e6] text-[#2e6b3e]' : 'bg-[#f3eef5] text-[#716977]'}`}>
                <Check className="size-3.5" aria-hidden="true" />8+ characters
              </span>
              <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 ${confirmPasswordValue && passwordValue === confirmPasswordValue ? 'bg-[#eaf3e6] text-[#2e6b3e]' : 'bg-[#f3eef5] text-[#716977]'}`}>
                <Check className="size-3.5" aria-hidden="true" />Passwords match
              </span>
            </div>

            <RecoveryError id="recovery-reset-error" message={resetError} />

            <button type="submit" disabled={passwordForm.formState.isSubmitting || isBusy} className={primaryButtonClassName}>
              {status === 'resetting' ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
              {status === 'resetting' ? 'Securing account…' : 'Set new password'}
            </button>

            <button type="button" onClick={() => setStep('otp')} disabled={isBusy} className="mx-auto inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#5f5864] hover:bg-[#f1ecf8] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f378a]">
              <ArrowLeft className="size-4" aria-hidden="true" />Back to code
            </button>
          </form>
        ) : null}

        <p className="mt-6 text-center text-sm text-[#5f5864]">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-[#4f378a] underline-offset-4 hover:underline">Back to login</Link>
        </p>
      </div>
    </AuthShell>
  )
}

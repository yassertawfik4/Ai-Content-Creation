import { Link } from 'react-router-dom'
import { LoaderCircle, MailCheck, RefreshCw } from 'lucide-react'
import { AuthShell } from '../components/AuthShell'
import { OtpInput } from '../components/OtpInput'
import { maskEmail } from '@/lib/maskEmail'

const inputClassName =
  'h-[50px] rounded-xl border border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] outline-none transition placeholder:text-[#a29ba8] focus-visible:border-[#4f378a] focus-visible:ring-2 focus-visible:ring-[#4f378a]/25 disabled:cursor-not-allowed disabled:opacity-60'

const primaryClassName =
  'h-14 w-full gap-2 rounded-xl bg-[#4f378a] text-sm font-semibold tracking-[1.4px] text-white shadow-lg shadow-[#4f378a]/20 transition-colors hover:bg-[#432f75] disabled:cursor-not-allowed disabled:opacity-60'

const labelClassName = 'text-sm font-medium tracking-[1.4px] text-[#494551]'

import { useOtpLogin } from '../hooks/useOtpLogin'

export function OtpLoginPage() {
  const {
    countdown,
    email,
    emailError,
    formError,
    formatCountdown,
    handleResend,
    handleSend,
    handleVerify,
    isEmailStep,
    notice,
    otp,
    setEmail,
    setEmailError,
    setFormError,
    setNotice,
    setOtp,
    setStatus,
    status,
  } = useOtpLogin()

  if (status === 'success') {
    return (
      <AuthShell>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="auth-pop mb-6 flex size-20 items-center justify-center rounded-full bg-[#e6f3e1] shadow-[0_0_0_10px_rgba(58,130,74,0.08)]">
            <MailCheck className="size-9 text-[#2e6b3e]" strokeWidth={2.2} />
          </span>
          <h1 className="auth-fade-up font-display text-[38px] leading-[1.1] tracking-[-1px]">
            You&apos;re signed in
          </h1>
          <p className="auth-fade-up auth-fade-up-delay mt-3 text-sm leading-6 text-[#494551]">
            Verifying your session — taking you to your workspace…
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      {isEmailStep ? (
        <div className="auth-rise flex flex-col">
          <div className="flex flex-col gap-1">
            <div className="pt-5 sm:pt-7">
              <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
                Sign in with a code
              </h1>
            </div>
            <p className="text-sm leading-5 text-[#494551] sm:max-w-[360px]">
              We&apos;ll email a one-time code to confirm it&apos;s really you. No password needed.
            </p>
          </div>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSend} noValidate>
            <div className="flex flex-col gap-2">
              <label className={labelClassName} htmlFor="otp-email">
                Work Email
              </label>
              <input
                id="otp-email"
                type="email"
                autoComplete="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (emailError) setEmailError('')
                }}
                disabled={status === 'sending'}
                className={inputClassName}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'otp-email-error' : undefined}
              />
              {emailError ? (
                <p id="otp-email-error" role="alert" className="text-xs leading-5 text-destructive">
                  {emailError}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p role="alert" className="auth-drop text-sm leading-5 text-destructive">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className={primaryClassName}
            >
              {status === 'sending' ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                'Send my code'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm leading-5 text-[#494551] sm:mt-8">
            <Link
              to="/login"
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Back to password login
            </Link>
          </p>
        </div>
      ) : (
        <div className="auth-rise flex flex-col">
          <div className="flex flex-col gap-1">
            <div className="pt-5 sm:pt-7">
              <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
                Check your inbox
              </h1>
            </div>
            <p className="text-sm leading-5 text-[#494551] sm:max-w-[380px]">
              Enter the 6-digit code below. It expires in a few minutes.
            </p>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 shadow-sm">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4f378a]/10">
              <MailCheck className="size-5 text-[#4f378a]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[1px] text-[#494551] uppercase">
                Code sent to
              </p>
              <p className="truncate text-sm font-medium text-[#1d1b20]">{maskEmail(email)}</p>
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-5" onSubmit={handleVerify} noValidate>
            <div className="flex flex-col gap-3">
              <span className={labelClassName} id="otp-code-label">
                Verification code
              </span>
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value)
                  if (formError) setFormError('')
                }}
                autoFocus
                disabled={status === 'verifying'}
                error={Boolean(formError)}
                describedBy={formError ? 'otp-code-error' : 'otp-code-help'}
              />
              {formError ? (
                <p
                  id="otp-code-error"
                  role="alert"
                  className="auth-drop text-sm leading-5 text-destructive"
                >
                  {formError}
                </p>
              ) : (
                <p id="otp-code-help" className="text-xs leading-5 text-[#494551]">
                  {otp.length}/6 digits entered
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || status === 'verifying'}
              className={primaryClassName}
            >
              {status === 'verifying' ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify & sign in'
              )}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-3">
            {notice ? (
              <p role="status" className="auth-drop text-sm leading-5 text-[#2e6b3e]">
                {notice}
              </p>
            ) : null}
            <div className="flex items-center gap-2 text-sm leading-5 text-[#494551]">
              {countdown.isRunning ? (
                <span className="flex items-center gap-2 tabular-nums">
                  <RefreshCw className="size-4 animate-spin-slow" />
                  Resend in {formatCountdown(countdown.seconds)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
                >
                  Resend the code
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setOtp('')
                setFormError('')
                setNotice('')
              }}
              className="text-sm font-medium text-[#494551] underline-offset-4 hover:text-[#4f378a] hover:underline"
            >
              Use a different email
            </button>
          </div>

          <p className="mt-6 text-center text-sm leading-5 text-[#494551]">
            <Link
              to="/login"
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Back to password login
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}

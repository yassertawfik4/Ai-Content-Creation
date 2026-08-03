import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandMark from '@/assets/auth/brand-mark.svg'
import { getErrorMessage, sendVerificationOtp, verifyEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      await verifyEmailOtp({ email: email.trim(), otp: otp.trim() })
      await refreshSession()
      const from = location.state?.from
      navigate(typeof from === 'string' ? from : '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setIsResending(true)
    try {
      await sendVerificationOtp({ email: email.trim(), type: 'email-verification' })
      setNotice('A new verification code was sent to your email.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#fef7ff] px-6 py-12 text-[#1d1b20]">
      <section className="w-full max-w-[448px] rounded-2xl border border-[#ded5e2] bg-white p-7 shadow-[0_20px_60px_rgba(56,30,114,0.1)] sm:p-10">
        <div className="flex items-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#4f378a] shadow-lg shadow-black/10">
            <img src={brandMark} alt="" className="size-[19px]" />
          </span>
          <span className="pl-2 text-[22px] font-medium leading-7">AetherFlow AI</span>
        </div>
        <h1 className="mt-10 font-display text-[38px] leading-[1.1] tracking-[-1px]">Verify your email</h1>
        <p className="mt-3 text-sm leading-6 text-[#494551]">
          Enter the six-digit code we sent to finish creating your account.
        </p>

        <form className="mt-8 flex flex-col gap-5" onSubmit={handleVerify} noValidate>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#494551]" htmlFor="verify-email">
            Email
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-12 rounded-md border border-[#cbc4d2] px-4 outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/15"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#494551]" htmlFor="verify-otp">
            Verification code
            <input
              id="verify-otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              required
              className="h-12 rounded-md border border-[#cbc4d2] px-4 text-lg tracking-[0.35em] outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/15"
            />
          </label>

          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p role="status" className="text-sm text-[#315016]">{notice}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || isResending || !email.trim() || otp.length !== 6}
            className="h-13 rounded-md bg-[#4f378a] text-sm font-semibold tracking-[1.2px] text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#432f75] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying…' : 'Verify email'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting || isResending || !email.trim()}
            className="text-sm font-semibold text-[#4f378a] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? 'Sending code…' : 'Resend code'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#494551]">
          <Link to="/login" className="font-semibold text-[#4f378a] hover:underline">Back to login</Link>
        </p>
      </section>
    </main>
  )
}

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandMark from '@/assets/auth/brand-mark.svg'
import { getErrorMessage, sendVerificationOtp, signInEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'

export function OtpLoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSend = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      await sendVerificationOtp({ email: email.trim(), type: 'sign-in' })
      setStep('otp')
      setNotice('A sign-in code was sent to your email.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      await signInEmailOtp({ email: email.trim(), otp: otp.trim() })
      await refreshSession()
      const from = location.state?.from
      navigate(typeof from === 'string' ? from : '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
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
        <h1 className="mt-10 font-display text-[38px] leading-[1.1] tracking-[-1px]">Email sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#494551]">
          Get a one-time code by email. No password required.
        </p>

        <form className="mt-8 flex flex-col gap-5" onSubmit={step === 'email' ? handleSend : handleSignIn} noValidate>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#494551]" htmlFor="otp-email">
            Email
            <input
              id="otp-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={step === 'otp'}
              className="h-12 rounded-md border border-[#cbc4d2] px-4 outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/15 disabled:bg-[#f5f0f6]"
            />
          </label>
          {step === 'otp' ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-[#494551]" htmlFor="login-otp">
              Sign-in code
              <input
                id="login-otp"
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
          ) : null}

          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p role="status" className="text-sm text-[#315016]">{notice}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || (step === 'otp' && otp.length !== 6)}
            className="h-13 rounded-md bg-[#4f378a] text-sm font-semibold tracking-[1.2px] text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#432f75] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Please wait…' : step === 'email' ? 'Send sign-in code' : 'Sign in'}
          </button>
        </form>

        {step === 'otp' ? (
          <button
            type="button"
            onClick={() => {
              setStep('email')
              setOtp('')
              setNotice('')
            }}
            className="mt-4 block w-full text-sm font-semibold text-[#4f378a] underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        ) : null}
        <p className="mt-7 text-center text-sm text-[#494551]">
          <Link to="/login" className="font-semibold text-[#4f378a] hover:underline">Back to password login</Link>
        </p>
      </section>
    </main>
  )
}

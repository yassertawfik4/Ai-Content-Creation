import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage, sendVerificationOtp, signInEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'

const RESEND_COOLDOWN_SECONDS = 60

export function useOtpLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('idle')
  const countdown = useCountdown(0)

  const isEmailStep = status !== 'email-sent' && status !== 'verifying' && status !== 'success'

  const startResendCooldown = () => countdown.restart(RESEND_COOLDOWN_SECONDS)

  const handleSend = async (event) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setEmailError('Enter a valid work email to receive your code.')
      return
    }
    setEmailError('')
    setFormError('')
    setNotice('')
    setStatus('sending')
    try {
      await sendVerificationOtp({ email: trimmed, type: 'sign-in' })
      setStatus('email-sent')
      setNotice('A sign-in code was sent to your inbox.')
      startResendCooldown()
    } catch (err) {
      setFormError(getErrorMessage(err))
      setStatus('idle')
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    if (otp.length !== 6) return
    setFormError('')
    setNotice('')
    setStatus('verifying')
    try {
      await signInEmailOtp({ email: email.trim(), otp: otp.trim() })
      await refreshSession()
      setStatus('success')
    } catch (err) {
      setFormError(getErrorMessage(err))
      setStatus('email-sent')
    }
  }

  const handleResend = async () => {
    setFormError('')
    setNotice('')
    setOtp('')
    setStatus('email-sent')
    try {
      await sendVerificationOtp({ email: email.trim(), type: 'sign-in' })
      setNotice('A fresh sign-in code was sent to your inbox.')
      startResendCooldown()
    } catch (err) {
      setFormError(getErrorMessage(err))
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



  return {
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
  }
}

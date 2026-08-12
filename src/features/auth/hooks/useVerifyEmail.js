import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage, sendVerificationOtp, verifyEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'

const RESEND_COOLDOWN_SECONDS = 60
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function useVerifyEmail() {
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



  return {
    beginEmailChange,
    cancelEmailChange,
    countdown,
    editingEmail,
    email,
    emailDraft,
    emailError,
    formError,
    formatCountdown,
    handleResend,
    handleSendToEmail,
    handleVerify,
    hasSentCode,
    isBusy,
    isResending,
    isSending,
    isVerifying,
    notice,
    otp,
    setEmailDraft,
    setEmailError,
    setFormError,
    setNotice,
    setOtp,
    status,
  }
}

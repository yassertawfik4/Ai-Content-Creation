import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { checkPasswordResetOtp, getErrorMessage, requestPasswordResetOtp, resetPasswordWithOtp } from '@/lib/authApi'
import { useCountdown } from '@/hooks/useCountdown'
import { forgotPasswordEmailSchema, resetPasswordSchema } from '../schema/authSchema'

const RESEND_COOLDOWN_SECONDS = 60

const RECOVERY_COPY = {
  email: { eyebrow: 'Account recovery', title: 'Forgot your password?', description: 'Enter your account email and we’ll send a private 6-digit recovery code.' },
  otp: { eyebrow: 'Check your inbox', title: 'Prove it’s you.', description: 'Enter the code from your email. It expires in five minutes for your protection.' },
  password: { eyebrow: 'Final step', title: 'Create a new password.', description: 'Choose a fresh password for your account. Your other active sessions will be signed out.' },
}

function recoveryErrorMessage(error) {
  if (error?.code === 'OTP_EXPIRED') return 'That code has expired. Request a fresh code to continue.'
  if (error?.code === 'INVALID_OTP') return 'That code is not correct. Check the email and try again.'
  if (error?.code === 'TOO_MANY_ATTEMPTS') return 'Too many attempts. Request a new code and try again.'
  return getErrorMessage(error)
}

export function usePasswordRecovery() {
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



  return {
    confirmPasswordValue,
    copy,
    countdown,
    emailForm,
    formatCountdown,
    handleEmailSubmit,
    handleOtpSubmit,
    handlePasswordSubmit,
    handleResend,
    isBusy,
    notice,
    otp,
    otpError,
    passwordForm,
    passwordValue,
    recoveryEmail,
    requestError,
    resetError,
    setNotice,
    setOtp,
    setOtpError,
    setStep,
    status,
    step,
  }
}

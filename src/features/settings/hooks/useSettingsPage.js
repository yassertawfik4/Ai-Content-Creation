import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { changePassword, getErrorMessage, updateUser } from '@/lib/authApi'
import { createBillingPortal, getCreditUsage, getSubscription } from '@/lib/billingApi'
import { readUserPreferences, saveUserPreferences } from '@/lib/userPreferences'
import { passwordSettingsSchema, profileSettingsSchema } from '../schema/settingsSchema'
export function useSettingsPage() {
  const { user, logout, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [profileStatus, setProfileStatus] = useState(null)
  const [passwordStatus, setPasswordStatus] = useState(null)
  const [preferences, setPreferences] = useState(readUserPreferences)
  const [loggingOut, setLoggingOut] = useState(false)
  const [billing, setBilling] = useState({ subscription: null, usage: null, loading: true, error: '' })
  const [openingPortal, setOpeningPortal] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { name: user?.name || '' },
  })
  const passwordForm = useForm({
    resolver: zodResolver(passwordSettingsSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true,
    },
  })

  useEffect(() => {
    profileForm.reset({ name: user?.name || '' })
  }, [profileForm, user?.name])

  useEffect(() => {
    let active = true
    getSubscription()
      .then(async (subscription) => {
        const usage = await getCreditUsage()
        if (active) setBilling({ subscription, usage, loading: false, error: '' })
      })
      .catch((error) => {
        if (active) setBilling({ subscription: null, usage: null, loading: false, error: getErrorMessage(error) })
      })
    return () => {
      active = false
    }
  }, [])

  const updatePreferences = (updates) => {
    setPreferences((current) => saveUserPreferences({ ...current, ...updates }))
  }

  const newPassword = useWatch({
    control: passwordForm.control,
    name: 'newPassword',
    defaultValue: '',
  })
  const strength = useMemo(() => {
    const checks = [
      newPassword.length >= 8,
      /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      /\d/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ]
    return checks.filter(Boolean).length
  }, [newPassword])

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileStatus(null)
    try {
      await updateUser(values)
      await refreshSession({ disableCookieCache: true })
      setProfileStatus({ type: 'success', message: 'Your profile name has been updated.' })
    } catch (error) {
      setProfileStatus({ type: 'error', message: getErrorMessage(error) })
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordStatus(null)
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      })
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: values.revokeOtherSessions,
      })
      setPasswordStatus({
        type: 'success',
        message: values.revokeOtherSessions
          ? 'Password changed. Other signed-in devices have been disconnected.'
          : 'Your password has been changed successfully.',
      })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: getErrorMessage(error) })
    }
  })

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await logout()
    navigate('/')
  }

  const openPaymentSettings = async () => {
    setOpeningPortal(true)
    try {
      const { url } = await createBillingPortal()
      window.location.assign(url)
    } catch (error) {
      setBilling((current) => ({ ...current, error: getErrorMessage(error) }))
      setOpeningPortal(false)
    }
  }

  const joinedDate = user?.createdAt
    ? new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(user.createdAt))
    : 'Recently'


  return {
    billing,
    handleLogout,
    joinedDate,
    loggingOut,
    openPaymentSettings,
    openingPortal,
    passwordForm,
    passwordStatus,
    preferences,
    profileForm,
    profileStatus,
    savePassword,
    saveProfile,
    strength,
    updatePreferences,
    user,
  }
}

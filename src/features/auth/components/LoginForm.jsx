import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import arrowRight from '@/assets/auth/arrow-right.svg'
import eyeIcon from '@/assets/auth/eye.svg'
import eyeOffIcon from '@/assets/auth/eye-off.svg'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '../schema/authSchema'

const inputClassName =
  'h-[50px] rounded-md border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] shadow-none placeholder:text-[#6b7280] focus-visible:border-[#4f378a] focus-visible:ring-2 focus-visible:ring-[#4f378a]/15'

export function LoginForm({ onSuccess, onUnverified }) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formError, setFormError] = useState('')
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    setFormError('')
    try {
      await login({ email: values.email, password: values.password, rememberMe })
      onSuccess?.({ ...values, rememberMe })
    } catch (err) {
      if (err?.code === 'EMAIL_NOT_VERIFIED') {
        onUnverified?.(values.email)
      } else {
        setFormError(getErrorMessage(err))
      }
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium tracking-[1.4px] text-[#494551]"
        >
          Work Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="alex@company.com"
          className={inputClassName}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="login-email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <Label
            htmlFor="password"
            className="text-sm font-medium tracking-[1.4px] text-[#494551]"
          >
            Password
          </Label>
          <Link
            to="/forgot-password"
            className="rounded-md text-xs font-semibold text-[#4f378a] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f378a]"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClassName} pr-12`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 flex w-7 items-center justify-center rounded text-[#494551] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f378a]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <img src={showPassword ? eyeIcon : eyeOffIcon} alt="" className="h-[15px] w-[22px]" />
          </button>
        </div>
        {errors.password ? (
          <p id="login-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col items-start gap-3 text-sm text-[#494551] sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="rounded-[4px] border-[#cbc4d2] bg-white data-[checked]:border-[#4f378a] data-[checked]:bg-[#4f378a]"
          />
          Remember me
        </label>
        <Link to="/otp-login" className="font-semibold text-[#4f378a] underline-offset-4 hover:underline">
          Sign in with email code
        </Link>
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full gap-2 rounded-md bg-[#4f378a] text-sm font-semibold tracking-[1.4px] text-white shadow-lg shadow-black/10 hover:bg-[#432f75]"
      >
        {isSubmitting ? 'Logging in…' : 'Log In'}
        {isSubmitting ? null : <img src={arrowRight} alt="" className="size-4" />}
      </Button>

    </form>
  )
}

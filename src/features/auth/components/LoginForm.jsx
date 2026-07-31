import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import arrowRight from '@/assets/auth/arrow-right.svg'
import eyeIcon from '@/assets/auth/eye.svg'
import facebookIcon from '@/assets/auth/facebook.svg'
import googleIcon from '@/assets/auth/google.svg'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '../schema/authSchema'

const inputClassName =
  'h-[50px] rounded-md border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] shadow-none placeholder:text-[#6b7280] focus-visible:border-[#4f378a] focus-visible:ring-2 focus-visible:ring-[#4f378a]/15'

export function LoginForm({ onSuccess }) {
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
      await login({ email: values.email, password: values.password })
      onSuccess?.({ ...values, rememberMe })
    } catch (err) {
      setFormError(getErrorMessage(err))
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
        <Label
          htmlFor="password"
          className="text-sm font-medium tracking-[1.4px] text-[#494551]"
        >
          Password
        </Label>
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
            <img src={eyeIcon} alt="" className="h-[15px] w-[22px]" />
          </button>
        </div>
        {errors.password ? (
          <p id="login-password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex w-full items-center justify-between text-sm text-[#494551]">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="rounded-[4px] border-[#cbc4d2] bg-white data-[checked]:border-[#4f378a] data-[checked]:bg-[#4f378a]"
          />
          Remember me
        </label>
        <a
          href="#forgot-password"
          className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
        >
          Forgot password?
        </a>
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

      <div className="flex items-center py-4" aria-hidden="true">
        <span className="h-px flex-1 bg-[#cbc4d2]" />
        <span className="px-4 text-xs font-medium leading-4 text-[#494551]">
          OR CONTINUE WITH
        </span>
        <span className="h-px flex-1 bg-[#cbc4d2]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 rounded-md border-[#cbc4d2] bg-white text-sm font-semibold tracking-[1.4px] text-[#1d1b20] hover:bg-[#f8f3fa]"
          aria-label="Continue with Gmail"
        >
          <img src={googleIcon} alt="" className="size-5" />
          Gmail
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 rounded-md border-[#cbc4d2] bg-white text-sm font-semibold tracking-[1.4px] text-[#1d1b20] hover:bg-[#f8f3fa]"
          aria-label="Continue with Facebook"
        >
          <img src={facebookIcon} alt="" className="size-5" />
          Facebook
        </Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import arrowRight from '@/assets/auth/arrow-right.svg'
import eyeIcon from '@/assets/auth/eye.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '../schema/authSchema'

const inputClassName =
  'h-[50px] rounded-md border-[#cbc4d2] bg-white px-4 text-base text-[#1d1b20] shadow-none placeholder:text-[#6b7280] focus-visible:border-[#4f378a] focus-visible:ring-2 focus-visible:ring-[#4f378a]/15'

export function RegisterForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    setFormError('')
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password })
      onSuccess?.(values)
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
          htmlFor="name"
          className="text-sm font-medium tracking-[1.4px] text-[#494551]"
        >
          Full Name
        </Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Alex Rivera"
          className={inputClassName}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name ? (
          <p id="name-error" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

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
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="email-error" className="text-xs text-destructive">
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
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${inputClassName} pr-12`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : 'password-help'}
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
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        ) : (
          <p id="password-help" className="text-xs leading-4 text-[#494551]">
            Minimum 8 characters with one special symbol.
          </p>
        )}
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
        {isSubmitting ? 'Creating your team…' : 'Create Your Team'}
        {isSubmitting ? null : (
          <img src={arrowRight} alt="" className="size-4" />
        )}
      </Button>

    </form>
  )
}

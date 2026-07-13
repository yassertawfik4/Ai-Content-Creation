import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema } from '../schema/authSchema'
import { GoogleIcon } from './GoogleIcon'

export function RegisterForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    // TODO: wire up to the auth API once it's implemented.
    onSuccess?.(values)
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-2.5 pt-1.5">
        <Label
          htmlFor="name"
          className="text-xs font-semibold tracking-[0.6px] text-muted-foreground uppercase"
        >
          Full name
        </Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Jane Doe"
          className="h-[46px] rounded-xl border-[#6b7280] px-[17px] py-[11px] text-sm dark:border-[#6b7280]"
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="email"
          className="text-xs font-semibold tracking-[0.6px] text-muted-foreground uppercase"
        >
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          className="h-[46px] rounded-xl border-[#6b7280] px-[17px] py-[11px] text-sm dark:border-[#6b7280]"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="password"
          className="text-xs font-semibold tracking-[0.6px] text-muted-foreground uppercase"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-[46px] rounded-xl border-[#6b7280] px-[17px] py-[11px] pr-11 text-sm dark:border-[#6b7280]"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-[16px] flex items-center text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-semibold tracking-[0.6px] text-muted-foreground uppercase"
        >
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-[46px] rounded-xl border-[#6b7280] px-[17px] py-[11px] pr-11 text-sm dark:border-[#6b7280]"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute inset-y-0 right-[16px] flex items-center text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[50px] w-full rounded-xl bg-primary text-base font-semibold"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <div className="relative flex items-center py-4">
        <div className="w-full border-t border-[#c4c7c7]" />
        <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-xs font-semibold tracking-[0.6px] text-muted-foreground uppercase">
          Or continue with
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-[50px] w-full gap-2 rounded-xl border-[#c4c7c7] text-base font-semibold"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </form>
  )
}

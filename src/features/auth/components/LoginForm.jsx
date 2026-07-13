import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { loginSchema } from '../schema/authSchema'
import { GoogleIcon } from './GoogleIcon'

export function LoginForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    // TODO: wire up to the auth API once it's implemented.
    onSuccess?.({ ...values, rememberMe })
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-2.5 pt-1.5">
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
            autoComplete="current-password"
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

      <div className="flex w-full items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="rounded-[4px] border-[#c4c7c7]"
          />
          Remember me
        </label>
        <a href="#" className="text-sm font-semibold text-foreground">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[50px] w-full rounded-xl bg-primary text-base font-semibold"
      >
        {isSubmitting ? 'Signing in…' : 'Sign In'}
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

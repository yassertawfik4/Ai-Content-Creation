import { Link, useLocation, useNavigate } from 'react-router-dom'
import brandMark from '@/assets/auth/brand-mark.svg'
import { LoginForm } from '../components/LoginForm'
import { RegisterShowcasePanel } from '../components/RegisterShowcasePanel'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSuccess = () => {
    const from = location.state?.from
    navigate(typeof from === 'string' ? from : '/', { replace: true })
  }

  return (
    <main className="flex min-h-svh w-full bg-[#fef7ff] text-[#1d1b20]">
      <section className="flex w-full shrink-0 flex-col justify-center px-6 py-12 sm:px-8 xl:w-[812px] xl:py-16">
        <div className="mx-auto flex w-full max-w-[448px] flex-col gap-10">
          <header className="flex flex-col gap-1">
            <div className="flex items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4f378a] shadow-lg shadow-black/10">
                <img src={brandMark} alt="" className="size-[19px]" />
              </span>
              <span className="pl-2 text-[22px] font-medium leading-7">AetherFlow AI</span>
            </div>

            <div className="pt-7">
              <h1 className="font-display text-[42px] leading-[1.25] tracking-[-1.05px]">
                Welcome Back
              </h1>
            </div>
            <p className="text-sm leading-5 text-[#494551]">
              Log in and keep your autonomous marketing workforce moving.
            </p>
          </header>

          <LoginForm onSuccess={handleSuccess} />

          <p className="text-center text-sm leading-5 text-[#494551]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center text-[11px] leading-[17.88px] text-[#494551]/60">
            By continuing, you agree to AetherFlow AI&apos;s{' '}
            <a href="#terms" className="underline underline-offset-2">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="underline underline-offset-2">
              Privacy Policy
            </a>
            . Precision
            <br />
            Marketing Workforce © 2024.
          </p>
        </div>
      </section>

      <RegisterShowcasePanel />
    </main>
  )
}

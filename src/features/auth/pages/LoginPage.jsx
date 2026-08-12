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

  const handleUnverified = (email) => {
    navigate('/verify-email', {
      state: { email, from: location.state?.from },
    })
  }

  return (
    <main className="flex min-h-dvh w-full bg-[#fef7ff] text-[#1d1b20] xl:h-dvh xl:overflow-hidden">
      <section className="flex w-full shrink-0 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 xl:h-dvh xl:w-[46%] xl:overflow-y-auto xl:px-10 xl:py-8 2xl:w-[812px]">
        <div className="mx-auto flex w-full max-w-[448px] flex-col gap-7 sm:gap-8 xl:gap-9">
          <header className="flex flex-col gap-1">
            <div className="flex items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#4f378a] shadow-lg shadow-black/10">
                <img src={brandMark} alt="" className="size-[19px]" />
              </span>
              <span className="pl-2 text-[22px] font-medium leading-7">Sada</span>
            </div>

            <div className="pt-5 sm:pt-7">
              <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
                Welcome Back
              </h1>
            </div>
            <p className="text-sm leading-5 text-[#494551]">
              Log in and keep your autonomous marketing workforce moving.
            </p>
          </header>

          <LoginForm onSuccess={handleSuccess} onUnverified={handleUnverified} />

          <p className="text-center text-sm leading-5 text-[#494551]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center text-[11px] leading-[17.88px] text-[#494551]/60">
            By continuing, you agree to Sada&apos;s{' '}
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

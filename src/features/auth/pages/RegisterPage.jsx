import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { RegisterForm } from '../components/RegisterForm'
import { RegisterShowcasePanel } from '../components/RegisterShowcasePanel'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <main className="scrollbar-hidden flex h-dvh w-full overflow-y-auto bg-[#fef7ff] text-[#1d1b20] xl:overflow-hidden">
      <section className="scrollbar-hidden flex w-full shrink-0 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 xl:h-dvh xl:w-[46%] xl:overflow-y-auto xl:px-10 xl:py-8 2xl:w-[812px]">
        <div className="mx-auto flex w-full max-w-[448px] flex-col gap-7 sm:gap-8 xl:gap-9">
          <header className="flex flex-col gap-1">
            <div className="flex items-center">
              <AppLogo size="lg" />
              <span className="pl-2 text-[22px] font-medium leading-7">Sada</span>
            </div>

            <div className="pt-5 sm:pt-7">
              <h1 className="font-display text-[36px] leading-[1.2] tracking-[-0.9px] sm:text-[42px] sm:leading-[1.25] sm:tracking-[-1.05px]">
                Create Your Account
              </h1>
            </div>
            <p className="text-sm leading-5 text-[#494551]">
              Start building your autonomous marketing workforce today.
            </p>
          </header>

          <RegisterForm
            onSuccess={(values) =>
              navigate('/verify-email', {
                replace: true,
                state: { email: values.email, from: location.state?.from },
              })
            }
          />

          <p className="text-center text-sm leading-5 text-[#494551]">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="font-semibold text-[#4f378a] underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>

          <p className="text-center text-[11px] leading-[17.88px] text-[#494551]/60">
            By signing up, you agree to Sada&apos;s{' '}
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

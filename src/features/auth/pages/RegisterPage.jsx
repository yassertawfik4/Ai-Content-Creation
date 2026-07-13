import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { RegisterForm } from '../components/RegisterForm'
import { AuthModeToggle } from '../components/AuthModeToggle'
import { AuthIllustrationPanel } from '../components/AuthIllustrationPanel'

export function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_38%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:w-[760px] lg:p-8 xl:p-10">
        <div className="relative flex w-full max-w-[540px] flex-col overflow-hidden rounded-[32px] border border-border/70 bg-background/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur md:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/80" />

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary">
                  <Sparkles className="size-[20px] text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-[-0.02em] text-foreground">
                    AI Content Workspace
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Create polished content faster
                  </p>
                </div>
              </div>
              <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
                Create your account
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Join the workspace to generate blogs, ad copy, emails, and social posts in one place.
              </p>
            </div>

            <div className="flex justify-center">
              <AuthModeToggle />
            </div>

            <RegisterForm onSuccess={() => navigate('/login')} />
          </div>

          <div className="mt-6 border-t border-dashed border-border/70 pt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>

      <AuthIllustrationPanel />
    </div>
  )
}

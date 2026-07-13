import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { LoginForm } from '../components/LoginForm'
import { AuthModeToggle } from '../components/AuthModeToggle'
import { AuthIllustrationPanel } from '../components/AuthIllustrationPanel'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full bg-background">
      <div className="relative flex w-full shrink-0 flex-col items-center justify-center p-12 lg:w-[760px]">
        <div className="flex w-full max-w-[480px] flex-col items-start gap-8">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="size-[22px] text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-black tracking-[-1.2px] text-foreground">
                AI Content Workspace
              </h1>
            </div>
            <p className="text-base text-muted-foreground">
              Create blogs, social media posts, marketing copy, emails, and
              AI-generated content in one intelligent workspace.
            </p>
          </div>

          <AuthModeToggle />

          <LoginForm onSuccess={() => navigate('/')} />
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-12 opacity-60">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 AI Content Workspace. All rights reserved.
          </p>
        </div>
      </div>

      <AuthIllustrationPanel />
    </div>
  )
}

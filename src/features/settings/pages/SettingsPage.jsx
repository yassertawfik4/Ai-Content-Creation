import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenText,
  Check,
  ChevronRight,
  CircleUserRound,
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  LogOut,
  MonitorCog,
  PlugZap,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { InterfacePreferences } from '../components/InterfacePreferences'
import {
  formatBillingDate,
  normalizeInterval,
} from '@/features/billing/format'

const inputClassName =
  'h-12 w-full rounded-2xl border border-[#d9cfe1] bg-white px-4 text-sm text-[#2f2735] shadow-[0_1px_2px_rgba(29,27,32,0.03)] outline-none transition placeholder:text-[#9a909f] focus:border-[#675094] focus:ring-4 focus:ring-[#675094]/10 disabled:bg-[#f5f1f7] disabled:text-[#7b7180]'

function initialsFor(name) {
  return String(name || 'A')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function SettingsBrand() {
  return (
    <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-[13px] bg-[#381e72] text-white shadow-[0_7px_18px_rgba(56,30,114,0.24)]">
      <span className="absolute -right-1 -top-2 size-6 rounded-full bg-[#b7f36b]" />
      <Sparkles className="relative size-5" strokeWidth={2.2} />
    </span>
  )
}

function SectionCard({ id, eyebrow, title, description, icon: Icon, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="scroll-mt-28 overflow-hidden rounded-[26px] border border-[#e0d7e5] bg-[#fffaff]/92 shadow-[0_14px_44px_rgba(55,38,65,0.08)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-4 border-b border-[#ece4ee] px-5 py-5 sm:px-7">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eee5f7] text-[#4f378a] ring-1 ring-[#ded0ea]">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#79688b]">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.35px] text-[#241d29]">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#716777]">{description}</p>
        </div>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </motion.section>
  )
}

function FieldError({ id, message }) {
  return message ? (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-[#a42f42]">
      {message}
    </p>
  ) : null
}

function PasswordField({ id, label, error, register, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#3a313f]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClassName} pr-12 ${error ? 'border-[#ba546c] focus:border-[#a42f42] focus:ring-[#a42f42]/10' : ''}`}
          {...register}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#746979] transition hover:bg-[#f1eaf4] hover:text-[#4f378a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094]"
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

function StatusMessage({ state }) {
  return (
    <AnimatePresence mode="wait">
      {state?.message ? (
        <motion.div
          key={`${state.type}-${state.message}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role={state.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            state.type === 'error'
              ? 'border-[#efc5cf] bg-[#fff2f5] text-[#8f2942]'
              : 'border-[#cfe5bf] bg-[#f3faed] text-[#355f20]'
          }`}
        >
          {state.type === 'error' ? <LockKeyhole className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}
          <span>{state.message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

import { useSettingsPage } from '../hooks/useSettingsPage'

export function SettingsPage() {
  const {
    billing,
    handleLogout,
    joinedDate,
    loggingOut,
    openPaymentSettings,
    openingPortal,
    passwordForm,
    passwordStatus,
    preferences,
    profileForm,
    profileStatus,
    savePassword,
    saveProfile,
    strength,
    updatePreferences,
    user,
  } = useSettingsPage()

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8f2f8] text-[#241d29]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 top-20 size-[420px] rounded-full bg-[#dfcef1]/35 blur-3xl" />
        <div className="absolute -left-40 top-[40%] size-[360px] rounded-full bg-[#f1cad5]/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(#8e799d_0.7px,transparent_0.7px)] [background-size:20px_20px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[#ded7e3]/90 bg-[#fffaff]/88 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Sada home">
            <SettingsBrand />
            <span className="hidden text-[17px] font-semibold tracking-[-0.4px] text-[#201a25] sm:inline">
              Sada
            </span>
          </Link>
          <span className="hidden h-6 w-px bg-[#dfd6e2] sm:block" />
          <span className="text-sm font-medium text-[#6e6374]">Account settings</span>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[1240px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <aside className="lg:sticky lg:top-[104px] lg:h-fit lg:self-start">
          <div className="overflow-hidden rounded-[26px] border border-[#e0d7e5] bg-[#fffaff]/90 p-4 shadow-[0_14px_44px_rgba(55,38,65,0.07)] backdrop-blur-xl">
            <div className="settings-profile-summary rounded-[21px] bg-[linear-gradient(145deg,#eee2f6,#f9edf1)] p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#4f378a] text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.24)]">
                  {initialsFor(user?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#2b2230]">{user?.name || 'Sada user'}</p>
                  <p className="mt-0.5 truncate text-xs text-[#796f7e]">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-[#46692e]">
                <BadgeCheck className="size-4" />
                {user?.emailVerified ? 'Verified account' : 'Email verification pending'}
              </div>
            </div>

            <nav className="mt-3 space-y-1" aria-label="Settings sections">
              {[
                ['profile', UserRound, 'Profile'],
                ['billing', CreditCard, 'Plan & credits'],
                ['security', KeyRound, 'Password & security'],
                ['preferences', MonitorCog, 'Preferences'],
                ['account', CircleUserRound, 'Account details'],
              ].map(([href, Icon, label]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="settings-nav-link group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition"
                >
                  <Icon className="size-[18px]" />
                  {label}
                  <ChevronRight className="ml-auto size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 px-1 pb-2 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#806f90]">Personal workspace</p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-1.1px] text-[#241d29] sm:text-[40px] sm:leading-[1.08]">
                Make Sada feel like yours.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#706576]">
                Keep your identity current, strengthen your sign-in, and tune the interface to the way you work.
              </p>
            </div>
            <Link
              to="/generate"
              className="inline-flex min-h-11 shrink-0 self-end items-center gap-2 rounded-2xl border border-[#d9cfe1] bg-white px-4 text-sm font-semibold text-[#4f378a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#bca9cf] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#675094] sm:self-start"
            >
              <ArrowLeft className="size-4" />
              Back to workspace
            </Link>
          </motion.div>

          <SectionCard
            id="profile"
            eyebrow="Identity"
            title="Profile information"
            description="This name appears in your account menu and throughout your workspace."
            icon={UserRound}
          >
            <form onSubmit={saveProfile} className="space-y-5" noValidate>
              <StatusMessage state={profileStatus} />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-name" className="mb-2 block text-sm font-semibold text-[#3a313f]">Display name</label>
                  <input
                    id="settings-name"
                    autoComplete="name"
                    aria-invalid={Boolean(profileForm.formState.errors.name)}
                    aria-describedby={profileForm.formState.errors.name ? 'settings-name-error' : undefined}
                    className={inputClassName}
                    {...profileForm.register('name')}
                  />
                  <FieldError id="settings-name-error" message={profileForm.formState.errors.name?.message} />
                </div>
                <div>
                  <label htmlFor="settings-email" className="mb-2 block text-sm font-semibold text-[#3a313f]">Email address</label>
                  <input id="settings-email" value={user?.email || ''} readOnly className={inputClassName} />
                  <p className="mt-1.5 text-xs text-[#7b7180]">Your sign-in email is managed securely and cannot be changed here.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#4f378a] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d4597] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {profileForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {profileForm.formState.isSubmitting ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            id="billing"
            eyebrow="Subscription"
            title="Plan, payment & credits"
            description="See the plan on your account, your billing cycle, and exactly how many generation credits you have used."
            icon={CreditCard}
          >
            {billing.loading ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-[#716777]">
                <Loader2 className="size-4 animate-spin" /> Loading billing details…
              </div>
            ) : billing.error ? (
              <div role="alert" className="rounded-2xl border border-[#efc5cf] bg-[#fff2f5] p-4 text-sm text-[#8f2942]">{billing.error}</div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
                  <div className="relative overflow-hidden rounded-[22px] bg-[#381e72] p-5 text-white shadow-[0_16px_34px_rgba(56,30,114,0.2)]">
                    <span className="absolute -right-12 -top-16 size-44 rounded-full bg-[#b7f36b]/15" aria-hidden="true" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#d9ffa8]">Current plan</p>
                        <p className="mt-2 font-display text-3xl font-bold">{billing.usage?.plan?.name ?? billing.subscription?.plan?.name ?? 'Free'}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {billing.subscription?.billingInterval
                            ? `${normalizeInterval(billing.subscription.billingInterval) === 'year' ? 'Yearly' : 'Monthly'} billing`
                            : 'Included with your account'}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white">
                        {billing.subscription?.status === 'ACTIVE' ? 'Active' : billing.subscription?.status?.replaceAll('_', ' ') ?? 'Included'}
                      </span>
                    </div>
                    {billing.subscription?.pendingPlanId ? (
                      <p className="relative mt-6 border-t border-white/12 pt-4 text-xs text-white/65">
                        Switching to {billing.subscription.pendingPlan?.name ?? 'a new plan'} on{' '}
                        {formatBillingDate(billing.subscription.pendingEffectiveAt) ?? 'the end of this period'}.
                        Manage it on the billing page.
                      </p>
                    ) : billing.subscription?.currentPeriodEnd ? (
                      <p className="relative mt-6 border-t border-white/12 pt-4 text-xs text-white/65">
                        Current billing period ends {formatBillingDate(billing.subscription.currentPeriodEnd)}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-[22px] border border-[#e3d9e7] bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#392f3e]"><Coins className="size-4 text-[var(--aether-accent)]" /> Generation credits</div>
                      <span className="text-xs font-semibold text-[#796f7e]">Monthly allowance</span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                      {[
                        ['Available', billing.usage?.remaining ?? 0],
                        ['Used', billing.usage?.used ?? 0],
                        ['Total', billing.usage?.limit ?? 0],
                      ].map(([label, value]) => (
                        <div key={label} className="billing-credit-stat rounded-2xl px-2 py-3">
                          <p className="text-xl font-bold text-[#332a38]">{Number(value).toLocaleString()}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#817487]">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="billing-credit-track mt-5 h-2 overflow-hidden rounded-full" aria-label={`${billing.usage?.used ?? 0} of ${billing.usage?.limit ?? 0} credits used`}>
                      <div className="billing-credit-fill h-full rounded-full transition-[width]" style={{ width: `${billing.usage?.limit ? Math.min(100, ((billing.usage.used ?? 0) / billing.usage.limit) * 100) : 0}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-[#766b7b]">Credits reset {billing.usage?.periodEnd ? new Date(billing.usage.periodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'monthly'}.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#e3d9e7] bg-[#faf6fb] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#5d4597] shadow-sm"><ShieldCheck className="size-5" /></span>
                    <div><p className="text-sm font-semibold text-[#392f3e]">Payments secured by Stripe</p><p className="mt-1 text-xs leading-5 text-[#766b7b]">Card details and invoices are handled securely on Stripe’s payment pages.</p></div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {billing.subscription?.stripeCustomerId ? (
                      <button type="button" onClick={openPaymentSettings} disabled={openingPortal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d3c5dd] bg-white px-4 text-sm font-bold text-[#4f378a] transition hover:border-[#aa95bb] disabled:cursor-wait disabled:opacity-60">
                        {openingPortal ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                        {openingPortal ? 'Opening…' : 'Payment & invoices'}
                      </button>
                    ) : null}
                    <Link to="/billing" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#5d4597]">
                      Manage plan <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            id="security"
            eyebrow="Security"
            title="Change your password"
            description="Use a unique password you do not use for another account."
            icon={KeyRound}
          >
            <form onSubmit={savePassword} className="space-y-5" noValidate>
              <StatusMessage state={passwordStatus} />
              <PasswordField
                id="current-password"
                label="Current password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                register={passwordForm.register('currentPassword')}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField
                  id="new-password"
                  label="New password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.newPassword?.message}
                  register={passwordForm.register('newPassword')}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  register={passwordForm.register('confirmPassword')}
                />
              </div>

              <div className="rounded-2xl border border-[#e4dae8] bg-[#faf6fb] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#413647]">Password strength</p>
                  <span className="text-xs font-bold text-[#6c5d75]">
                    {['Start typing', 'Weak', 'Fair', 'Good', 'Strong'][strength]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => (
                    <span key={level} className={`h-1.5 rounded-full transition-colors ${strength >= level ? (strength >= 4 ? 'bg-[#5c7c3d]' : 'bg-[#7b5aa5]') : 'bg-[#e5dce8]'}`} />
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-[#766b7b]">A strong password mixes upper and lowercase letters, numbers, and symbols.</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e2d8e6] bg-white p-4 transition hover:border-[#cbb9d5]">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#4f378a]"
                  {...passwordForm.register('revokeOtherSessions')}
                />
                <span>
                  <span className="block text-sm font-semibold text-[#3a313f]">Sign out other devices</span>
                  <span className="mt-1 block text-xs leading-5 text-[#766b7b]">Recommended if you are changing your password because of suspicious activity.</span>
                </span>
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#4f378a] px-5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(79,55,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d4597] disabled:translate-y-0 disabled:cursor-wait disabled:opacity-55"
                >
                  {passwordForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            id="preferences"
            eyebrow="Comfort"
            title="Interface preferences"
            description="Choose how Sada looks and feels across this browser."
            icon={MonitorCog}
          >
            <InterfacePreferences preferences={preferences} onChange={updatePreferences} />
          </SectionCard>

          <SectionCard
            id="account"
            eyebrow="Account"
            title="Account details"
            description="Useful identity information and shortcuts for your workspace."
            icon={CircleUserRound}
          >
            <div className="rounded-2xl border border-[#e3d9e7] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#817487]">Member since</p>
              <p className="mt-2 text-base font-semibold text-[#332a38]">{joinedDate}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['/generate', Layers3, 'Generate', 'Create a campaign'],
                ['/connectors', PlugZap, 'Connectors', 'Manage integrations'],
                ['/knowledge', BookOpenText, 'Knowledge', 'Tune brand context'],
              ].map(([to, Icon, label, detail]) => (
                <Link key={to} to={to} className="group rounded-2xl border border-[#e3d9e7] bg-[#faf6fb] p-4 transition hover:-translate-y-0.5 hover:border-[#c8b6d3] hover:bg-white hover:shadow-md">
                  <Icon className="size-5 text-[#5a4270]" />
                  <p className="mt-3 text-sm font-bold text-[#392f3e]">{label}</p>
                  <p className="mt-1 text-xs text-[#7a6f7f]">{detail}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#f0cfd7] bg-[#fff5f7] p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#713246]">Sign out of this device</p>
                <p className="mt-1 text-xs leading-5 text-[#8b6070]">You will need your email and password to return.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#f8dfe6] px-4 text-sm font-bold text-[#972d4b] transition hover:bg-[#f3ccd7] disabled:cursor-wait disabled:opacity-60"
              >
                {loggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  )
}

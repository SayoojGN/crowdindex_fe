'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#fcf9f2', fontFamily: 'var(--font-sans)' }}
    >
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-5 relative overflow-hidden"
        style={{ backgroundColor: '#1c1c18' }}
      >
        {/* Ambient blobs */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[60%] rounded-full pointer-events-none"
          style={{ background: '#9e422533', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{ background: '#46606633', filter: 'blur(80px)' }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 hover:opacity-80 transition-opacity self-start">
          <img src="/iconMain.svg" alt="CrowdIndex" className="h-10 w-auto" />
        </Link>

        {/* Illustration + tagline */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <p
              className="text-2xl font-extrabold tracking-tight leading-snug"
              style={{ color: '#fcf9f2', fontFamily: 'var(--font-heading)' }}
            >
              Start uncovering{' '}
              <span style={{ color: '#9e4225', fontStyle: 'italic' }}>real intelligence</span>
              {' '}in minutes.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(252,249,242,0.5)' }}>
              Sign up free and add your first entity in under a minute.
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <p
          className="text-[10px] uppercase tracking-widest relative z-10"
          style={{ color: 'rgba(252,249,242,0.3)', fontFamily: 'var(--font-heading)' }}
        >
          © 2025 CrowdIndex Intelligence
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">

          {/* Header */}
          <div className="space-y-2">
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: '#1c1c18', fontFamily: 'var(--font-heading)' }}
            >
              Create your account
            </h1>
            <p className="text-sm" style={{ color: '#424849' }}>
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: '#9e4225' }}
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8 space-y-5"
            style={{
              backgroundColor: '#fff',
              border: '1px solid rgba(193,199,201,0.25)',
              boxShadow: '0 4px 32px rgba(28,28,24,0.06)',
            }}
          >
            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#424849', fontFamily: 'var(--font-heading)' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#f6f3ec',
                    color: '#1c1c18',
                    border: '1.5px solid transparent',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#9e4225')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#424849', fontFamily: 'var(--font-heading)' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#f6f3ec',
                    color: '#1c1c18',
                    border: '1.5px solid transparent',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#9e4225')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
                />
              </div>

              {state?.error && (
                <p
                  className="text-xs rounded-lg px-3 py-2"
                  style={{ color: '#9e4225', backgroundColor: '#ffdbd14d' }}
                >
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center px-6 py-3.5 rounded-full font-bold text-sm text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1c1c18', fontFamily: 'var(--font-heading)' }}
              >
                {isPending ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

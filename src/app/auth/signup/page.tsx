'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="w-full max-w-sm px-4 space-y-8">

        {/* Wordmark */}
        <div className="text-center space-y-1">
          <h1
            className="text-3xl font-semibold tracking-tight text-[#0e0e0e]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            CrowdIndex
          </h1>
          <p className="text-sm text-[#6b6b6b]">Create your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/50 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-[#f0f0f0] rounded-lg px-4 py-3 text-sm text-[#0e0e0e] placeholder:text-[#6b6b6b]/50 border-0 border-b-2 border-b-transparent focus:border-b-[#4664ff] focus:outline-none transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-xs text-[#e55a2b] bg-[#e55a2b]/10 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-[#4664ff] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3355ee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6b6b6b]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#4664ff] hover:text-[#3355ee] transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

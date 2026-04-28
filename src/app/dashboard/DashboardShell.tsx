'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Plus, LogOut } from 'lucide-react'
import { signout } from '../auth/actions'
import EntityHistory from './EntityHistory'
import AddEntityModal from './AddEntityModal'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white/80 backdrop-blur-xl">

        {/* Logo */}
        <div className="flex h-14 items-center px-5">
          <span
            className="text-base font-semibold tracking-tight text-[#0e0e0e]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            CrowdIndex
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0e0e0e] transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0e0e0e] transition-colors text-left"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Entity
          </button>
        </nav>

        {/* Separator */}
        <div className="mx-4 h-px bg-black/5" />

        {/* Entity history */}
        <div className="flex-1 overflow-y-auto">
          <EntityHistory />
        </div>

        {/* Sign out */}
        <div className="px-3 py-3">
          <div className="h-px bg-black/5 mb-3" />
          <form action={signout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#e55a2b] transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f5f5f5]">
        {children}
      </main>

      <AddEntityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

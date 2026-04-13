import Link from 'next/link'
import { LayoutDashboard, Plus, LogOut } from 'lucide-react'
import { signout } from '../auth/actions'
import EntityHistory from './EntityHistory'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/add-entity', label: 'Add Entity', icon: Plus },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      {/* Sidebar — glassmorphism */}
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

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3 py-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0e0e0e] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div className="mx-4 h-px bg-black/5" />

        {/* Entity history — takes remaining space, scrolls if needed */}
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
    </div>
  )
}

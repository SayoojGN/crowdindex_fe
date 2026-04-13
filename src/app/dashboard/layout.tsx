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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex h-14 items-center px-4 border-b border-border">
          <span className="text-sm font-semibold text-sidebar-foreground">CrowdIndex</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-2 border-b border-border">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Entity history — takes remaining space, scrolls if needed */}
        <div className="flex-1 overflow-y-auto border-b border-border">
          <EntityHistory />
        </div>

        {/* Sign out */}
        <div className="p-2">
          <form action={signout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

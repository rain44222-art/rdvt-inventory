'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ArrowLeftRight, Users, LogOut } from 'lucide-react'
import { logout } from '@/app/auth-actions'

export default function Nav({ profile }: { profile: any }) {
  const pathname = usePathname()
  
  const items = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assets', label: 'Assets', icon: Package },
    { href: '/movements', label: 'Movements', icon: ArrowLeftRight },
  ]

  // Tambah menu Users kalau role admin
  if (profile?.role === 'admin') {
    items.push({ href: '/users', label: 'Users', icon: Users })
  }

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-white flex-col p-4 z-30">
        <h1 className="text-xl font-bold mb-6">RDVT Inventory</h1>
        <nav className="flex-1 space-y-1">
          {items.map((i) => (
            <Link
              key={i.href} href={i.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                active(i.href) ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <i.icon size={18} /> {i.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 pt-3 space-y-1 text-sm">
          <p className="text-slate-200 font-medium truncate">{profile?.full_name}</p>
          <p className="text-xs text-slate-500 uppercase">{profile?.role}</p>
          <form action={logout}>
            <button className="flex items-center gap-2 text-slate-300 hover:text-white w-full py-2 mt-2">
              <LogOut size={16} /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        {items.map((i) => (
          <Link
            key={i.href} href={i.href}
            className={`flex-1 flex flex-col items-center py-3 text-[10px] font-medium transition-colors ${
              active(i.href) ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <i.icon size={22} className="mb-1" />
            {i.label}
          </Link>
        ))}
        <form action={logout} className="flex-1">
          <button className="w-full h-full flex flex-col items-center py-3 text-[10px] font-medium text-slate-500 hover:text-red-500">
            <LogOut size={22} className="mb-1" />
            Logout
          </button>
        </form>
      </nav>
    </>
  )
}
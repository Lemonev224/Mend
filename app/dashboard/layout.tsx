// app/dashboard/layout.tsx
'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from "react"
import Link from "next/link"
import { CloudLightning } from "lucide-react"
import { signOut } from "@/lib/backend/auth/auth"
import { useRouter } from "next/navigation"

// Dynamically import DeleteAccount with no SSR
const DeleteAccount = dynamic(
  () => import('./components/DeleteAccount'),
  { ssr: false }
)

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <CloudLightning className="w-8 h-8 text-slate-600 fill-slate-50/50" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-600 transition-colors">
              Mend
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <DeleteAccount />
            
            <span className="text-sm text-slate-500">
              Revenue Recovery
            </span>
              <a
    href="mailto:contact@advisorly.uk?subject=Mend%20Support%20Request"
    className="text-sm text-slate-500 hover:text-slate-900 px-3 py-1 rounded hover:bg-slate-100"
    target="_blank"
    rel="noopener noreferrer"
  >
    Support
  </a>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-900 px-3 py-1 rounded hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signIn } from "@/lib/backend/auth/auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push('/dashboard')
        }
      } catch (error) {
        // No user, stay on login page
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
  if (!email) {
    setError('Please enter your email address first')
    return
  }

  try {
    const response = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend confirmation email')
    }

    // Show success message
    setError('')
    alert('Confirmation email resent! Please check your inbox.')
    
  } catch (err: any) {
    console.error('Resend error:', err)
    setError(err.message || 'Failed to resend confirmation email')
  }
}

// Then, modify the error display section to handle unverified users better:
{error && (
  <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
    {error}
    {error.includes('Email not confirmed') && (
      <div className="mt-2">
        <button
          onClick={handleResendConfirmation}
          className="text-blue-600 hover:underline text-sm"
        >
          Resend verification email
        </button>
      </div>
    )}
  </div>
)}

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 px-6">
        <div className="hidden md:flex flex-col justify-center pr-12">
          <div className="text-xl font-semibold tracking-tight text-slate-900">
            Mend
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-4 max-w-md text-slate-600">
            Access your revenue recovery dashboard and monitor failed payments,
            recoveries, and outreach performance.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Sign in to your account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                href="/sign-up"
                className="font-medium text-slate-900 hover:underline"
              >
                Create account
              </Link>

              <Link
                href="/forgot-password"
                className="text-slate-500 hover:text-slate-900"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signUp } from '@/lib/backend/auth/auth'
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push('/dashboard')
        }
      } catch (error) {
        // No user, stay on signup page
      }
    }
    checkAuth()
  }, [router])

  const sendWelcomeEmailAPI = async (email: string, name: string) => {
    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: 'Failed to send welcome email' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await signUp(email, password, fullName)

      if (response.user) {
        setSuccess(true)
        
        // Send welcome email (async, doesn't block UI)
        sendWelcomeEmailAPI(email, fullName).catch(err => 
          console.error("Background email task failed:", err)
        )
        
        console.log('Signup successful, awaiting confirmation')
      } else {
        throw new Error('Could not create user account')
      }
      
    } catch (err: any) {
      console.error('Signup error:', err)
      if (err.message?.includes('already registered')) {
        setError('An account with this email already exists.')
      } else {
        setError(err.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute bottom-1/4 -left-40 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 px-6">
        <div className="hidden md:flex flex-col justify-center pr-12">
          <div className="text-xl font-semibold tracking-tight text-slate-900">
            Mend
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Get started for free
          </h1>

          <p className="mt-4 max-w-md text-slate-600">
            Connect Stripe, recover failed revenue automatically, and keep your
            customers without awkward emails.
          </p>

          <p className="mt-6 text-sm text-slate-500">
            Free to start • No credit card required
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                It takes less than a minute
              </p>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Check your email!</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We've sent a confirmation link to <strong>{email}</strong>.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> You must click the confirmation link in your email before you can log in.
                  </p>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Didn't receive the email? Check your spam folder.
                </p>
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      // Resend confirmation email
                      try {
                        const response = await fetch('/api/auth/resend-confirmation', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email })
                        })
                        
                        const data = await response.json()
                        
                        if (response.ok) {
                          alert('Confirmation email has been resent! Please check your inbox.')
                        } else {
                          alert('Failed to resend email: ' + (data.error || 'Unknown error'))
                        }
                      } catch (err) {
                        console.error('Resend error:', err)
                        alert('Failed to resend confirmation email.')
                      }
                    }}
                  >
                    Resend Confirmation
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Alex Johnson"
                    className="mt-1"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Work email
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
                    placeholder="At least 8 characters"
                    className="mt-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-slate-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

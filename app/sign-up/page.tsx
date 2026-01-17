'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signUp } from "@/lib/backend/auth/auth"
import { useRouter } from "next/navigation"
import { sendWelcomeEmail } from '@/lib/sendgrid'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // We destructure data and error. 
      // If your signUp function returns {user, session} directly, 
      // ensure your auth.ts helper wraps them in a 'data' object.
      const { data, error: signUpError }: any = await signUp(email, password, fullName)

      if (signUpError) {
        // Check if it's just an email confirmation error
        if (signUpError.message?.includes('Email not confirmed')) {
          console.log('User created, needs email confirmation')
          setSuccess(true)
          
          try {
            await sendWelcomeEmail(email, fullName)
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError)
          }
          return
        }
        throw signUpError
      }

      // Signup successful
      console.log('Signup successful:', data)
      
      try {
        await sendWelcomeEmail(email, fullName)
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }
      
      setSuccess(true)
      
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message || 'Failed to create account')
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
                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
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
                  <label className="text-sm font-medium text-slate-700">Work email</label>
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
                  <label className="text-sm font-medium text-slate-700">Password</label>
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
              <Link href="/login" className="font-medium text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
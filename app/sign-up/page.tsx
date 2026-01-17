'use client'

import { useEffect } from 'react'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signUp } from '@/lib/backend/auth/auth'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Shield } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendCount, setResendCount] = useState(0)
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

  const handleResendConfirmation = async () => {
    if (resendCount >= 3) {
      setError('Too many resend attempts. Please wait 5 minutes or contact support.')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)
    setError('')

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

      setResendSuccess(true)
      setResendCount(prev => prev + 1)
      
      // Show success message for 5 seconds
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)

    } catch (err: any) {
      console.error('Resend error:', err)
      setError(err.message || 'Failed to resend confirmation email')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOpenEmailClient = () => {
    // Create mailto link for popular email clients
    const gmailLink = `https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent('noreply@mendapp.tech')}+in%3Aanywhere`
    const outlookLink = `https://outlook.live.com/mail/0/inbox/search/from%3A${encodeURIComponent('noreply@mendapp.tech')}`
    
    // Try to detect email client
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('gmail') || userAgent.includes('google')) {
      window.open(gmailLink, '_blank')
    } else if (userAgent.includes('outlook') || userAgent.includes('microsoft')) {
      window.open(outlookLink, '_blank')
    } else {
      // Default mailto link
      window.location.href = `mailto:?subject=Check your Mend confirmation email`
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
              <div className="space-y-6">
                {/* Success Header */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Verify your email
                  </h3>
                  <p className="text-slate-600">
                    We've sent a confirmation link to
                  </p>
                  <div className="mt-2 mb-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                      <span className="font-medium">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuccess(false)}
                        className="h-6 px-2 text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Important Instructions Card */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          Important: Check your email now
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Click the verification link in the email</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>The link expires in 24 hours</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Verify to access your dashboard</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleOpenEmailClient}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    size="lg"
                  >
                    Open Email App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Need help?</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading || resendCount >= 3}
                      className="w-full"
                    >
                      {resendLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Verification Email
                          {resendCount > 0 && ` (${resendCount}/3)`}
                        </>
                      )}
                    </Button>

                    {resendSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <span>Verification email resent successfully!</span>
                      </div>
                    )}

                    {resendCount >= 3 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                        <span>Resend limit reached. Please wait 5 minutes or contact support.</span>
                      </div>
                    )}

                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/login">
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="text-sm text-slate-500 space-y-2">
                  <p className="font-medium text-slate-700">Didn't receive the email?</p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Allow a few minutes for delivery</li>
                    <li>Still having trouble? <a href="mailto:support@mendapp.tech" className="text-blue-600 hover:underline">Contact support</a></li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
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

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-slate-900 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

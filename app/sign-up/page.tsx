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

          {success && (
  <div className="space-y-6">
    {/* ... existing success content ... */}
    
    {/* Add this test verification button for development */}
    {process.env.NODE_ENV === 'development' && (
      <div className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          onClick={async () => {
            // For testing: Auto-confirm the user
            try {
              const { error } = await fetch('/api/auth/verify-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              }).then(r => r.json())
              
              if (!error) {
                alert('Test verification successful! You can now login.')
                router.push('/login')
              }
            } catch (err) {
              console.error('Test verification failed:', err)
            }
          }}
        >
          🚀 DEV ONLY: Auto-Verify Email
        </Button>
        <p className="text-xs text-amber-600 mt-2">
          This button only works in development. In production, users must click the email link.
        </p>
      </div>
    )}
  </div>
  )}
          </div>
        </div>
      </div>
    </div>
  )
}

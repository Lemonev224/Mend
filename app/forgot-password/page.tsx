'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '@/lib/backend/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
// Use the verification endpoint instead
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mendapp.tech'
const redirectTo = `${siteUrl}/api/auth/verify?redirect_to=/reset-password`
    
    // Add logging to debug
    console.log('Reset password redirect URL:', redirectTo);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo, // Use the hardcoded URL
    })

    if (error) throw error

    setSuccess(true)
  } catch (error: any) {
    console.error('Reset password error:', error);
    setError(error.message || 'Failed to send reset email')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <CardTitle className="text-center flex-1">Reset your password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Check your email</h3>
                <p className="text-slate-600 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Click the link in the email to reset your password.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="text-slate-600 mb-6 text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email address
                    </label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-slate-500 hover:text-slate-900"
                  >
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/sign-up" className="font-medium text-slate-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
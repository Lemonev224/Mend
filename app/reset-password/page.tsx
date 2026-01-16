// app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '@/lib/backend/supabaseClient'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [processing, setProcessing] = useState(true)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const processResetToken = async () => {
      try {
        console.log('=== RESET PASSWORD DEBUG START ===')
        console.log('Full URL:', window.location.href)
        
        // Check if we're coming from Supabase redirect (might be in query params)
        const url = new URL(window.location.href)
        const token = url.searchParams.get('token')
        const type = url.searchParams.get('type')
        
        console.log('URL Params:', { token, type })
        
        // If we have token in URL (from Supabase redirect), set session
        if (token && type === 'recovery') {
          console.log('Token found in URL, setting session...')
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: ''
          })
          
          if (sessionError) {
            console.error('Failed to set session:', sessionError)
            setError('Invalid or expired reset link. Please request a new one.')
            return
          }
          
          console.log('Session set successfully')
          setDebugInfo('Session established from URL token')
        }
        
        // Check if user has a session (either from URL token or already logged in)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No session found, checking hash fragment...')
          
          // Check hash fragment (common for OAuth redirects)
          const hash = window.location.hash.substring(1)
          if (hash) {
            const hashParams = new URLSearchParams(hash)
            const hashToken = hashParams.get('access_token')
            const hashType = hashParams.get('type')
            
            console.log('Hash params:', { hashToken, hashType })
            
            if (hashToken && hashType === 'recovery') {
              console.log('Token found in hash, setting session...')
              
              const { error: hashSessionError } = await supabase.auth.setSession({
                access_token: hashToken,
                refresh_token: ''
              })
              
              if (hashSessionError) {
                console.error('Failed to set session from hash:', hashSessionError)
              } else {
                console.log('Session set from hash')
                setDebugInfo('Session established from hash fragment')
                window.history.replaceState(null, '', '/reset-password')
              }
            }
          }
        }
        
        // Final session check
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        
        if (!finalSession) {
          console.log('No valid session after all attempts')
          setError('No valid reset session found. Please use the exact link from your email.')
          setDebugInfo('No session - user needs valid reset link')
        } else {
          console.log('User has valid session, ready for password reset')
          setDebugInfo('Ready to reset password')
        }
        
      } catch (error: any) {
        console.error('Error processing reset:', error)
        setError('Failed to process reset request: ' + error.message)
      } finally {
        setProcessing(false)
        console.log('=== RESET PASSWORD DEBUG END ===')
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      processResetToken()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Check session one more time
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Your reset session has expired. Please request a new reset link.')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // Sign out to force fresh login
      await supabase.auth.signOut()
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-2 text-slate-600">Processing reset request...</p>
                {debugInfo && (
                  <p className="mt-2 text-xs text-slate-500">{debugInfo}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <CardTitle className="text-center flex-1">Create new password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Password updated!</h3>
                <p className="text-slate-600 mb-6">
                  Your password has been successfully reset. You'll be redirected to login in a few seconds.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Go to login</Link>
                </Button>
              </div>
            ) : (
              <>
                {debugInfo && process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                    <p className="font-medium">Debug:</p>
                    <p>{debugInfo}</p>
                  </div>
                )}

                <p className="text-slate-600 mb-6 text-center">
                  Enter your new password below.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                    <p className="text-xs mt-2 text-red-600">
                      Make sure you're using the exact link from the reset email.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New password
                    </label>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm new password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Updating...' : 'Reset password'}
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
      </div>
    </div>
  )
}
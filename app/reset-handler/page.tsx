// app/reset-handler/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/backend/supabaseClient'

export default function ResetHandlerPage() {
  const router = useRouter()

  useEffect(() => {
    const handleReset = async () => {
      console.log('🔐 Reset handler triggered')
      
      try {
        // Get the full URL
        const currentUrl = window.location.href
        console.log('Current URL:', currentUrl)
        
        // Parse the URL to get parameters
        const url = new URL(currentUrl)
        
        // Check for token in query params (from Supabase redirect)
        const token = url.searchParams.get('token')
        const type = url.searchParams.get('type')
        
        console.log('URL params:', { token: !!token, type })
        
        if (token && type === 'recovery') {
          console.log('Setting session with token...')
          
          // Set session with the token
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: ''
          })
          
          if (error) {
            console.error('Failed to set session:', error)
            router.push('/login?error=invalid_token')
            return
          }
          
          console.log('Session set, redirecting to reset-password')
          // Clear the URL parameters
          window.history.replaceState({}, '', '/reset-handler')
          // Redirect to actual reset page
          router.push('/reset-password')
          return
        }
        
        // Check if user already has a session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Existing session:', !!session)
        
        if (session) {
          // User already has session, go to reset-password
          console.log('User has session, redirecting to reset-password')
          router.push('/reset-password')
        } else {
          // No session or token, go to login
          console.log('No session or token, going to login')
          router.push('/login')
        }
        
      } catch (error) {
        console.error('Reset handler error:', error)
        router.push('/login?error=reset_failed')
      }
    }

    handleReset()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-2 text-slate-600">Processing password reset...</p>
      </div>
    </div>
  )
}
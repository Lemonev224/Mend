// app/goodbye/page.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function GoodbyePage() {
  useEffect(() => {
    // Clear any remaining auth state
    localStorage.clear()
    sessionStorage.clear()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-slate-900 mb-3">
          Account Deletion Requested
        </h1>
        
        <div className="space-y-4 text-slate-600 mb-8">
          <p>
            Your account deletion has been initiated successfully.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-left">
            <p className="font-medium text-slate-900 mb-2">What happens next:</p>
            <ul className="space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>You've been logged out immediately</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Your data will be permanently deleted in 30 days</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>If you change your mind, contact support within 30 days</span>
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-slate-500">
            You'll receive a confirmation email shortly.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/landing">
              Back to Homepage
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <a href="mailto:support@mend.com">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
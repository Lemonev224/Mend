// app/dashboard/components/DeleteAccount.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/backend/supabaseClient'

export default function DeleteAccount() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [confirmation, setConfirmation] = useState('')
  const [deletionInfo, setDeletionInfo] = useState<{
    pendingCommissions?: number
    commissionCount?: number
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render dialog on server
  if (!isMounted) {
    return (
      <Button 
        variant="outline" 
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        disabled
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Account
      </Button>
    )
  }

  const checkDeletionEligibility = async () => {
    try {
      const response = await fetch('/api/account/delete', { 
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.pending_amount) {
        setDeletionInfo({
          pendingCommissions: data.pending_amount,
          commissionCount: data.commission_count
        })
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error)
    }
  }

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type "DELETE" to confirm')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get current user
          const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to delete your account')
    }

    console.log('User ID:', user.id)
    console.log('User email:', user.email)
    

      console.log('Attempting to delete account for user:', user.id)

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete account')
      }

      console.log('Delete successful, signing out...')

      // Success - sign out and redirect
      await supabase.auth.signOut()
      router.push('/goodbye')
      setOpen(false)

    } catch (error: any) {
      setError(error.message)
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleDelete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={checkDeletionEligibility}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Your Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        {deletionInfo?.pendingCommissions ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">Pending Commissions</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You have ${deletionInfo.pendingCommissions.toFixed(2)} in pending commissions 
                  ({deletionInfo.commissionCount} payment{deletionInfo.commissionCount !== 1 ? 's' : ''}).
                  These must be paid out before you can delete your account.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-700 space-y-1 list-disc pl-4">
                <li>Your Stripe connection & API keys</li>
                <li>Recovery history and statistics</li>
                <li>Commission records</li>
                <li>All personal information</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-red-600">
                Type "DELETE" to confirm
              </Label>
              <Input
                id="confirm"
                placeholder="DELETE"
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                className={error ? 'border-red-500' : ''}
                autoComplete="off"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="text-sm text-slate-600 space-y-2">
              <p className="font-medium">Important notes:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your data will be permanently deleted after 30 days</li>
                <li>You can contact support within 30 days to restore your account</li>
                <li>Any pending commissions will be forfeited</li>
                <li>This action is irreversible after 30 days</li>
              </ul>
            </div>
          </div>
        )}

        {!deletionInfo?.pendingCommissions && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setConfirmation('')
                setError('')
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || confirmation !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account Permanently'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
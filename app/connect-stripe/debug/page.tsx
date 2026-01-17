'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/backend/supabaseClient'
import { getCurrentUser } from '@/lib/backend/auth/auth'

export default function ConnectStripeDebug() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stripeAccount, setStripeAccount] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [envInfo, setEnvInfo] = useState<any>({})

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    console.log(msg)
  }

  useEffect(() => {
    checkStatus()
    // Check URL parameters from client side
    const urlParams = new URLSearchParams(window.location.search)
    const paramsObj: any = {}
    urlParams.forEach((value, key) => {
      paramsObj[key] = value
    })
    if (Object.keys(paramsObj).length > 0) {
      addLog(`URL params found: ${JSON.stringify(paramsObj)}`)
    }
  }, [])

  const checkStatus = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        addLog('No user found - redirecting to login')
        router.push('/login')
        return
      }
      setUser(user)
      addLog(`User found: ${user.email} (${user.id})`)

      // Check existing Stripe connection
      const { data, error } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        addLog(`Error checking Stripe account: ${error.message}`)
      } else if (data) {
        setStripeAccount(data)
        addLog(`Stripe account found: ${data.stripe_account_id}`)
        addLog(`Account status: ${data.account_details?.charges_enabled ? 'Active' : 'Pending'}`)
      } else {
        addLog('No Stripe account found for this user')
      }

      // Get environment info
      setEnvInfo({
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        hasStripeClientId: !!process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID,
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      })

    } catch (error: any) {
      addLog(`Error: ${error.message}`)
    }
  }

  const generateConnectUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID
    const redirectUri = 'https://mendapp.tech/api/connect'
    
    if (!user) {
      addLog('No user available')
      return
    }

    const authUrl = new URL('https://connect.stripe.com/oauth/authorize')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', clientId!)
    authUrl.searchParams.append('scope', 'read_write')
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('state', user.id)
    authUrl.searchParams.append('stripe_user[email]', user.email!)

    addLog(`Generated Connect URL: ${authUrl.toString()}`)
    
    // Open in new tab
    window.open(authUrl.toString(), '_blank')
    
    // Also copy to clipboard
    navigator.clipboard.writeText(authUrl.toString())
    addLog('URL copied to clipboard!')
  }

  const testApiConnect = async () => {
    try {
      addLog('Testing /api/connect endpoint...')
      const response = await fetch('/api/connect')
      const text = await response.text()
      try {
        const data = JSON.parse(text)
        addLog(`API Response: ${JSON.stringify(data, null, 2)}`)
      } catch {
        addLog(`Raw response (not JSON): ${text.substring(0, 200)}...`)
      }
    } catch (error: any) {
      addLog(`API Error: ${error.message}`)
    }
  }

  const testManualConnect = () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID) {
      addLog('ERROR: Stripe Client ID not found in environment variables')
      return
    }
    
    const manualUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=https://mendapp.tech/api/connect`
    
    addLog(`Manual URL (for testing without user): ${manualUrl}`)
    window.open(manualUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Stripe Connect Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">User</h3>
                  {user ? (
                    <div className="text-sm text-gray-600">
                      <p>Email: {user.email}</p>
                      <p className="truncate">ID: {user.id}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No user</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Stripe Account</h3>
                  {stripeAccount ? (
                    <div className="text-sm text-gray-600">
                      <p className="truncate">ID: {stripeAccount.stripe_account_id}</p>
                      <p className={`${stripeAccount.account_details?.charges_enabled ? 'text-green-600' : 'text-amber-600'}`}>
                        {stripeAccount.account_details?.charges_enabled ? '✅ Active' : '⚠️ Pending'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Environment</h3>
                  <div className="text-sm text-gray-600">
                    <p>App URL: {envInfo.appUrl || 'Not set'}</p>
                    <p>Stripe Client ID: {envInfo.hasStripeClientId ? '✅' : '❌'}</p>
                    <p>Stripe Secret Key: {envInfo.hasStripeSecretKey ? '✅' : '❌'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={generateConnectUrl} className="w-full">
                  Connect with Current User
                </Button>
                
                <Button onClick={testManualConnect} variant="outline" className="w-full">
                  Connect Without User
                </Button>
                
                <Button onClick={testApiConnect} variant="outline" className="w-full">
                  Test /api/connect
                </Button>
                
                <Button onClick={checkStatus} variant="ghost" className="w-full">
                  Refresh Status
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="ghost" 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Logs */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Debug Logs</CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLogs([])}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] overflow-y-auto bg-black text-green-400 font-mono text-xs p-4 rounded">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1 whitespace-pre-wrap">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Debug Stripe Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li>Click "Connect with Current User" to test the normal flow</li>
              <li>Check the logs for the generated URL</li>
              <li>Authorize the connection on Stripe</li>
              <li>Stripe will redirect back to `/api/connect?code=...&state=...`</li>
              <li>That should process and redirect to `/dashboard?connected=true`</li>
              <li>If it redirects back to `/connect-stripe`, check the error in the URL</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
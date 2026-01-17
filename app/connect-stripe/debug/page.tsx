'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/backend/supabaseClient'
import { getCurrentUser } from '@/lib/backend/auth/auth'

export default function ConnectStripeDebug() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [stripeAccount, setStripeAccount] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [urlInfo, setUrlInfo] = useState<any>({})

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    console.log(msg)
  }

  useEffect(() => {
    checkStatus()
    checkUrlParams()
  }, [])

  const checkUrlParams = () => {
    const params: any = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setUrlInfo(params)
    addLog(`URL params: ${JSON.stringify(params)}`)
  }

  const checkStatus = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        addLog('No user found')
        router.push('/login')
        return
      }
      setUser(user)
      addLog(`User: ${user.email} (${user.id})`)

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
        addLog(`Account details: ${JSON.stringify(data.account_details, null, 2)}`)
      } else {
        addLog('No Stripe account found')
      }
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

    addLog(`Generated URL: ${authUrl.toString()}`)
    
    return authUrl.toString()
  }

  const testDirectConnect = () => {
    const url = generateConnectUrl()
    if (url) {
      window.open(url, '_blank')
    }
  }

  const testApiConnect = async () => {
    try {
      addLog('Testing /api/connect endpoint...')
      const response = await fetch('/api/connect')
      const data = await response.json()
      addLog(`API Response: ${JSON.stringify(data)}`)
    } catch (error: any) {
      addLog(`API Error: ${error.message}`)
    }
  }

  const simulateCallback = () => {
    // This is what Stripe would send back
    const mockCode = 'ac_123_test'
    const mockState = user?.id || 'test_user_id'
    
    const callbackUrl = `https://mendapp.tech/api/connect?code=${mockCode}&state=${mockState}`
    addLog(`Mock callback URL: ${callbackUrl}`)
    window.open(callbackUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Stripe Connect Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
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
                      <p>ID: {user.id}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No user</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Stripe Account</h3>
                  {stripeAccount ? (
                    <div className="text-sm text-gray-600">
                      <p>Account ID: {stripeAccount.stripe_account_id}</p>
                      <p className="text-green-600">✅ Connected</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not connected</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Environment</h3>
                  <div className="text-sm text-gray-600">
                    <p>App URL: {process.env.NEXT_PUBLIC_APP_URL}</p>
                    <p>Has Client ID: {process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID ? '✅' : '❌'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>URL Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(urlInfo, null, 2)}
                </pre>
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
                <Button onClick={testDirectConnect} className="w-full">
                  Generate Stripe Connect URL
                </Button>
                
                <Button onClick={simulateCallback} variant="outline" className="w-full">
                  Simulate Stripe Callback
                </Button>
                
                <Button onClick={testApiConnect} variant="outline" className="w-full">
                  Test /api/connect Endpoint
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

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href="https://dashboard.stripe.com/connect/accounts/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Stripe Connect Dashboard
                </a>
                <a 
                  href="https://dashboard.stripe.com/settings/connect" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Stripe Connect Settings
                </a>
                <a 
                  href="https://mendapp.tech/connect-stripe" 
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Connect Stripe Page
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Logs */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Logs</CardTitle>
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
      </div>
    </div>
  )
}
// app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Check if this is a Supabase redirect with token
  if (url.pathname === '/reset-password') {
    const token = url.searchParams.get('token')
    const type = url.searchParams.get('type')
    
    // If we have Supabase token parameters, preserve them
    if (token && type === 'recovery') {
      // Keep them in the URL
      return NextResponse.next()
    }
    
    // Check for hash fragment (might be added by Supabase)
    const hash = request.headers.get('x-hash-fragment')
    if (hash && hash.includes('access_token')) {
      // Redirect with hash fragment
      url.hash = hash
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/reset-password',
}
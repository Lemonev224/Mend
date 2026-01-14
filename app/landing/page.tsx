'use client'
import { FinalCTA } from "./components/CTA"
import Features from "./components/Features"
import { Footer } from "./components/Footer"
import Hero from "./components/Hero"
import HowItWorks from "./components/HowItWorks"
import Pricing from "./components/Pricing"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import { FAQ } from "./components/FAQ"



export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push('/dashboard')
        }
      } catch (error) {
        // No user, stay on landing page
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
        <Footer />
    </div>
  )
}
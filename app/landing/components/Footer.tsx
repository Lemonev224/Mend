import Link from "next/link"
import { CloudLightning } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">

         {/* Brand */}
<Link href="/" className="flex items-center gap-2 group">
  <div className="relative">
    {/* The main cloud icon */}
    <CloudLightning className="w-8 h-8 text-slate-600 fill-slate-50/50" />
  
  </div>
  
  <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-600 transition-colors">
    Mend
  </span>
</Link>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Product
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#features" className="hover:text-slate-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-slate-900">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-slate-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Legal
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Mend. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Built for SaaS founders.
          </p>
        </div>
      </div>
    </footer>
  )
}

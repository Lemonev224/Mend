import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { CloudLightning, Sparkles} from "lucide-react"

export default function Hero() {
  return (
    <div className="relative bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

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

          {/* Nav links */}
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            {["How it works", "Pricing", "FAQ"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="relative transition-colors hover:text-slate-900
                  after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0
                  after:bg-slate-900 after:transition-all hover:after:w-full"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 md:block"
            >
              Sign in
            </Link>

            <Button size="sm" className="h-9 rounded-md bg-slate-900 hover:bg-slate-800">
              Recover revenue
            </Button>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Background (softened) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-48 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-slate-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="mx-auto max-w-3xl text-center">

            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              AI revenue recovery agent for SaaS
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Recover failed payments,
              <span className="block text-slate-700">
                without chasing customers
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600">
              Mend fixes <span className="text-slate-900 font-medium">involuntary churn</span>.
              When a customer’s card fails, Mend reaches out once — like a human —
              recovers the payment, and stops.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-11 px-8 bg-slate-900 hover:bg-slate-800">
                Start recovering revenue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* Message preview */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b px-4 py-2 text-xs text-slate-500">
                Example recovery message
              </div>
              <div className="p-6 text-sm leading-relaxed text-slate-700">
                <strong className="text-slate-900 font-medium">Hey Alex —</strong>
                <br /><br />
                Just a quick heads-up that your card didn’t go through this month.
                No rush — you can update it here when it’s convenient.
                <br /><br />
                <span className="text-slate-500">— Sam</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

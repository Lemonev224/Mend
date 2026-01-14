import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function Pricing() {
  const plans = [
    {
      name: "Mend",
      price: "$0",
      description: "Only pay when we recover revenue for you.",
      features: [
        "Unlimited real-time monitoring",
        "Automated email recovery",
        "Human-style outreach",
        "Recovery guardrails",
        "Success dashboard",
      ],
      cta: "Start recovering revenue",
    },
  ]

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Performance Pricing
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Mend only makes money
            <span className="block text-slate-700">when you do</span>
          </h2>
          <p className="mt-5 text-base text-slate-600">
            Zero monthly fees. Mend takes a 10% commission 
            only on successfully recovered revenue.
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto mt-16 max-w-md">
          <div className="group rounded-xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="text-4xl font-semibold text-slate-900 transition-all duration-300 group-hover:text-slate-800 group-hover:scale-105">
              $0 / mo
            </div>
            <p className="mt-2 text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
              10% of recovered revenue
            </p>

            <ul className="mt-8 space-y-4 text-left">
              {plans[0].features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-slate-700 transition-all duration-300 group-hover:text-slate-900">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110" />
                  <span className="transition-colors duration-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="mt-8 w-full bg-slate-900 hover:bg-black transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
             <Link href="/sign-up">Start recovering revenue</Link> 
            </Button>

            <p className="mt-4 text-xs text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
              No credit card required • Connect in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
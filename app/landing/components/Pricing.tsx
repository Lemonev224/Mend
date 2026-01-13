import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Mend",
      price: "$0",
      period: "/month",
      description: "Only pay when Mend recovers revenue for you.",
      features: [
        "Unlimited failed payment monitoring",
        "Email + SMS recovery",
        "Human-sounding messages",
        "Quiet hours & guardrails",
        "Recovered revenue dashboard",
      ],
      cta: "Start recovering revenue",
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Performance-based pricing
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Mend only makes money
            <span className="block text-slate-700">when you do</span>
          </h2>
          <p className="mt-5 text-base text-slate-600">
            There's no subscription. Mend takes a small percentage
            of successfully recovered revenue.
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto mt-20 max-w-xl">
          <div className="group rounded-xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
            <div className="text-4xl font-semibold text-slate-900 transition-all duration-300 group-hover:text-slate-800 group-hover:scale-105">
              $0
            </div>
            <p className="mt-2 text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
              10% of recovered revenue
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {plans[0].features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-slate-700 transition-all duration-300 group-hover:text-slate-900">
                  <Check className="mt-0.5 h-4 w-4 text-green-500 flex-shrink-0 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110" />
                  <span className="transition-colors duration-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="mt-8 w-full bg-slate-900 hover:bg-black transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
              Start recovering revenue
            </Button>

            <p className="mt-3 text-xs text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
import { CheckCircle2, Zap, Mail, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Listen for Failed Payments",
      description:
        "Mend connects to Stripe and listens for failed invoices in real time.",
      features: [
        "Stripe webhook integration",
        "No code required",
        "Instant detection",
      ],
      icon: <Zap className="h-5 w-5" />,
    },
    {
      step: "02",
      title: "Send a Human Follow-Up",
      description:
        "A calm, personal email is sent in your voice — not a billing template.",
      features: [
        "Founder-style tone",
        "Personalized context",
        "Email-first by default",
      ],
      icon: <Mail className="h-5 w-5" />,
    },
    {
      step: "03",
      title: "Recover or Stop",
      description:
        "If ignored, Mend sends one respectful mobile nudge — then stops.",
      features: [
        "SMS / WhatsApp fallback",
        "Quiet hours respected",
        "One-message rule",
      ],
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <CheckCircle2 className="h-3 w-3" />
            Simple by design
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Set it up once.
            <span className="block text-slate-700">Mend does the rest.</span>
          </h2>
          <p className="mt-5 text-base text-slate-600">
            No dashboards to babysit. No workflows to manage.
            Mend only acts when revenue is at risk.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-20 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <Card 
              key={step.step} 
              className="group border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-medium transition-all duration-300 group-hover:bg-slate-800 group-hover:scale-110">
                    {step.step}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-700 transition-all duration-300 group-hover:bg-slate-100 group-hover:scale-110">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-lg font-medium text-slate-900 transition-colors duration-300 group-hover:text-slate-800">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
                  {step.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {step.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm transition-all duration-300 group-hover:text-slate-900">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110" />
                      <span className="text-slate-700 transition-colors duration-300 group-hover:text-slate-900">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="h-11 px-8 bg-slate-900 hover:bg-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Start recovering revenue
          </Button>
          <p className="mt-3 text-sm text-slate-500">
            No setup fees • Connect Stripe in minutes
          </p>
        </div>
      </div>
    </section>
  )
}
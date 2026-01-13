import { CheckCircle, Mail, MessageSquare, ShieldCheck, BarChart3 } from "lucide-react"

export default function Features() {
  const features = [
    {
      title: "Detect Failed Payments Instantly",
      description:
        "Mend listens for failed Stripe payments in real time and responds the moment revenue is at risk.",
      icon: <Mail className="h-6 w-6" />,
      benefit: "No delays, no manual checks",
    },
    {
      title: "Human-Sounding Follow-Ups",
      description:
        "Messages are written in your voice and feel like a personal check-in — not a billing reminder.",
      icon: <MessageSquare className="h-6 w-6" />,
      benefit: "Customers feel helped, not chased",
    },
    {
      title: "Smart Channel Escalation",
      description:
        "Email first. SMS or WhatsApp only if ignored — and only once.",
      icon: <ShieldCheck className="h-6 w-6" />,
      benefit: "Respectful by default",
    },
    {
      title: "Recovered Revenue Tracking",
      description:
        "See exactly which customers were mended and how much revenue was recovered.",
      icon: <BarChart3 className="h-6 w-6" />,
      benefit: "Clear ROI, no guesswork",
    },
  ]

  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Designed for SaaS revenue
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Recover revenue without
            <span className="block text-slate-700">changing how you work</span>
          </h2>
          <p className="mt-5 text-base text-slate-600">
            Mend runs quietly in the background, fixing failed payments
            while you focus on building your product.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white transition-all duration-300 group-hover:bg-slate-800 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="text-lg font-medium text-slate-900 transition-colors duration-300 group-hover:text-slate-800">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
                {feature.description}
              </p>

              <div className="mt-4 flex items-start gap-2 text-sm text-slate-700 transition-all duration-300 group-hover:text-slate-900">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500 transition-all duration-300 group-hover:text-green-600 group-hover:scale-110" />
                <span>{feature.benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
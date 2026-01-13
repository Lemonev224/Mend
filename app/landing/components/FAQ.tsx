"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

export function FAQ() {
  const faqs = [
    {
      question: "Is Mend really free to use?",
      answer:
        "Yes. Mend has no monthly fee. We only take a small percentage of revenue that we successfully recover. If nothing is recovered, you pay nothing.",
    },
    {
      question: "How does Mend know when a payment fails?",
      answer:
        "Mend connects securely to your Stripe account and listens for failed payment events in real time. No manual setup or monitoring is required.",
    },
    {
      question: "Will this annoy my customers?",
      answer:
        "No. Mend is designed to be respectful by default. We send a single, calm email first. Only if that’s ignored do we send one brief mobile nudge — and then we stop.",
    },
    {
      question: "Can I control when messages are sent?",
      answer:
        "Yes. Mend respects quiet hours and avoids contacting customers at night. You can also disable SMS or WhatsApp entirely if you prefer email-only recovery.",
    },
    {
      question: "What makes Mend different from other dunning tools?",
      answer:
        "Most tools send automated billing reminders. Mend acts like a thoughtful human follow-up — written in your voice, sent only when necessary, and focused on fixing genuine issues rather than chasing payments.",
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative bg-white py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <HelpCircle className="h-3 w-3" />
            FAQ
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know before connecting Stripe.
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <button
                key={index}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full rounded-xl border border-slate-200 bg-white p-6 text-left transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isOpen && (
                  <p className="mt-4 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

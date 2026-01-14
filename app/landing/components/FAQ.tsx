"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

export function FAQ() {
  const faqs = [
    {
      question: "Is Mend really free to use?",
      answer:
        "Yes. There are no monthly fees. We only take a 10% commission on revenue we successfully recover for you.",
    },
    {
      question: "How does Mend track payments?",
      answer:
        "Mend securely connects to your Stripe account and monitors failed payment events in real-time. Setup takes minutes.",
    },
    {
      question: "Will this bother my customers?",
      answer:
        "No. Mend sends calm, personal emails designed to be helpful. We focus on fixing billing issues, not pestering users.",
    },
    {
      question: "How is Mend different from dunning tools?",
      answer:
        "Standard tools send cold billing reminders. Mend uses human-sounding emails written in your voice to recover revenue personally.",
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

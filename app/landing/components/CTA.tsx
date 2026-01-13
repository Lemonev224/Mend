import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="relative bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Recover revenue you already earned
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Mend quietly fixes failed payments caused by expired or declined cards —
            without pestering your customers or changing your workflow.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100"
              asChild
            >
              <a href="/signup">Connect Stripe</a>
            </Button>

            <Button
              size="lg"
              className="border border-white/70 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <a href="/how-it-works">See how Mend works</a>
            </Button>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            No monthly fees • Pay only on recovered revenue • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}

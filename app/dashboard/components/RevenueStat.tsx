// app/dashboard/components/RevenueStat.tsx
export default function RevenueStat() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
      <p className="text-sm text-slate-500">
        Recovered this month
      </p>

      <div className="mt-2 text-4xl font-semibold tracking-tight">
        $1,284
      </div>

      <p className="mt-2 text-sm text-slate-600">
        from 23 failed invoices
      </p>
    </div>
  )
}

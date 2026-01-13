// app/dashboard/components/TrustPanel.tsx
export default function TrustPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-medium text-slate-900">
        Customer experience
      </h3>

      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex justify-between text-slate-600">
          <span>Avg messages sent</span>
          <span className="text-slate-900">1.2</span>
        </li>
        <li className="flex justify-between text-slate-600">
          <span>SMS used</span>
          <span className="text-slate-900">18%</span>
        </li>
        <li className="flex justify-between text-slate-600">
          <span>Complaints</span>
          <span className="text-slate-900">0</span>
        </li>
      </ul>
    </div>
  )
}

// app/dashboard/components/ActivityTable.tsx
interface Recovery {
  customer_email: string;
  issue: string;
  channel: string;
  result: string;
  amount: string;
}

interface ActivityTableProps {
  recoveries: Recovery[];
}

export default function ActivityTable({ recoveries }: ActivityTableProps) {
  if (!recoveries || recoveries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No recovery activity yet
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b px-6 py-4">
        <h2 className="text-sm font-medium text-slate-900">
          Recent activity
        </h2>
      </div>

      <div className="divide-y">
        {recoveries.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 px-6 py-4 text-sm"
          >
            <span className="text-slate-900">{row.customer_email}</span>
            <span className="text-slate-600">{row.issue}</span>
            <span className="text-slate-600">{row.channel}</span>
            <span className="text-slate-900">{row.result}</span>
            <span className="text-right text-slate-900">
              {row.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
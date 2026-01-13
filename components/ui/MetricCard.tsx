import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export function MetricCard({ title, value, change, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-rose-500" />}
        {trend === 'neutral' && <Minus className="h-4 w-4 text-slate-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-rose-600' : 
          'text-slate-500'
        }`}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "not-submitted" | "submitted" | "pending"

interface SubmissionStatusProps {
  status: Status
  submittedAt?: string
  className?: string
}

const statusConfig: Record<Status, { icon: typeof CheckCircle2; label: string; description: string; className: string }> = {
  "not-submitted": {
    icon: Clock,
    label: "Noch nicht abgegeben",
    description: "Du kannst deine Lösung noch einreichen",
    className: "border-muted bg-muted/30 text-muted-foreground",
  },
  submitted: {
    icon: CheckCircle2,
    label: "Erfolgreich abgegeben",
    description: "Deine Lösung wurde eingereicht",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  },
  pending: {
    icon: AlertTriangle,
    label: "Wird ausgewertet",
    description: "Deine Lösung wird gerade überprüft",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  },
}

export function SubmissionStatus({ status, submittedAt, className }: SubmissionStatusProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4", config.className, className)}>
      <StatusIcon className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-medium">{config.label}</p>
        <p className="text-sm opacity-80">
          {submittedAt ? `Abgegeben um ${submittedAt}` : config.description}
        </p>
      </div>
    </div>
  )
}

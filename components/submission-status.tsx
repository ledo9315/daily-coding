import type { ComponentType } from "react";
import { Check, Clock, WarningBox } from "@nsmr/pixelart-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Status = "not-submitted" | "submitted" | "pending" | "failed";

interface SubmissionStatusProps {
  status: Status;
  submittedAt?: string;
  className?: string;
}

/** Icon, colour and message-key segment per status; label and description come from there. */
const statusConfig: Record<
  Status,
  {
    icon: ComponentType<{ className?: string }>;
    messageKey: "notSubmitted" | "submitted" | "pending" | "failed";
    className: string;
  }
> = {
  "not-submitted": {
    icon: Clock,
    messageKey: "notSubmitted",
    className: "border-muted bg-muted/30 text-muted-foreground",
  },
  submitted: {
    icon: Check,
    messageKey: "submitted",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  },
  pending: {
    icon: WarningBox,
    messageKey: "pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  },
  failed: {
    icon: WarningBox,
    messageKey: "failed",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

export function SubmissionStatus({
  status,
  submittedAt,
  className,
}: SubmissionStatusProps) {
  const t = useTranslations("challenge");
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border p-4",
        config.className,
        className,
      )}
    >
      <Icon className="h-8 w-8 shrink-0 text-current opacity-90" aria-hidden />
      <div>
        <p className="font-medium">
          {t(`submissionStatus.${config.messageKey}.label`)}
        </p>
        <p className="text-sm opacity-80">
          {submittedAt
            ? t("submissionStatus.submittedAt", { time: submittedAt })
            : t(`submissionStatus.${config.messageKey}.description`)}
        </p>
      </div>
    </div>
  );
}

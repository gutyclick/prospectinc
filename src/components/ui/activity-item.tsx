import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ActivityTone = "blue" | "green" | "orange" | "purple";

const toneStyles: Record<ActivityTone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-violet-50 text-violet-600",
};

type ActivityItemProps = {
  title: string;
  time: string;
  icon: LucideIcon;
  tone?: ActivityTone;
};

export function ActivityItem({
  title,
  time,
  icon: Icon,
  tone = "blue",
}: ActivityItemProps) {
  return (
    <article className="flex items-center gap-3 py-2.5">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          toneStyles[tone],
        )}
      >
        <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm text-slate-700">{title}</p>
      <time className="shrink-0 text-xs text-slate-400">{time}</time>
    </article>
  );
}

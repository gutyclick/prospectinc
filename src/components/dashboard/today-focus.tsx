import { Target } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import type { TodayRecommendation } from "@/lib/domain";

type TodayFocusProps = {
  recommendations: TodayRecommendation[];
};

export function TodayFocus({ recommendations }: TodayFocusProps) {
  return (
    <SectionCard
      title="Tu enfoque hoy"
      action={
        <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Target className="size-4" aria-hidden="true" />
        </span>
      }
      contentClassName="space-y-4"
    >
      <ol className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <li
            key={recommendation.id}
            className="flex items-start gap-3 text-sm text-slate-700"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5 leading-5">
              {recommendation.description}
            </span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

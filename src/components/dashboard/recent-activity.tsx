import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";
import {
  Clock3,
  FileText,
  MessageCircle,
  Search,
  Sparkles,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

import { ActivityItem } from "@/components/ui/activity-item";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import type { Activity, ActivityType } from "@/lib/domain";

type ActivityPresentation = {
  icon: LucideIcon;
  tone: "blue" | "green" | "orange" | "purple";
};

const activityPresentation: Record<ActivityType, ActivityPresentation> = {
  busqueda: { icon: Search, tone: "blue" },
  prospecto: { icon: UserRoundPlus, tone: "green" },
  propuesta: { icon: FileText, tone: "orange" },
  contacto: { icon: Sparkles, tone: "purple" },
  respuesta: { icon: MessageCircle, tone: "green" },
  seguimiento: { icon: Clock3, tone: "orange" },
};

type RecentActivityProps = {
  activities: Activity[];
  now?: Date;
};

export function RecentActivity({
  activities,
  now = new Date(),
}: RecentActivityProps) {
  return (
    <SectionCard
      title="Actividad reciente"
      contentClassName="divide-y divide-slate-100 py-1"
    >
      {activities.length === 0 ? (
        <EmptyState
          title="Sin actividad reciente"
          description="Las búsquedas, propuestas y respuestas aparecerán aquí."
          icon={Clock3}
        />
      ) : (
        activities.map((activity) => {
          const presentation = activityPresentation[activity.type];
          const relativeTime = formatDistanceStrict(
            new Date(activity.createdAt),
            now,
            {
              addSuffix: true,
              locale: es,
            },
          );

          return (
            <ActivityItem
              key={activity.id}
              title={activity.description}
              time={relativeTime}
              icon={presentation.icon}
              tone={presentation.tone}
            />
          );
        })
      )}
    </SectionCard>
  );
}

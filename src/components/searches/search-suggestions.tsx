import { Lightbulb, MapPin, MessageCircle } from "lucide-react";

import { ActivityItem } from "@/components/ui/activity-item";
import { SectionCard } from "@/components/ui/section-card";

export function SearchSuggestions() {
  return (
    <SectionCard
      title="Sugerencias de IA simuladas"
      description="Ideas determinísticas basadas en los datos del prototipo."
      contentClassName="divide-y divide-slate-100 py-1"
    >
      <ActivityItem
        title="Prueba clínicas dentales en zonas con alto volumen de reseñas."
        time="Idea"
        icon={Lightbulb}
        tone="blue"
      />
      <ActivityItem
        title="Los negocios sin web y con WhatsApp ofrecen un contacto directo."
        time="Idea"
        icon={MessageCircle}
        tone="green"
      />
      <ActivityItem
        title="Ciudad de Panamá concentra varias oportunidades del conjunto simulado."
        time="Idea"
        icon={MapPin}
        tone="purple"
      />
    </SectionCard>
  );
}

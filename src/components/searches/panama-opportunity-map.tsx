import { MapPinned } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";

export function PanamaOpportunityMap() {
  return (
    <SectionCard
      title="Mapa de oportunidades"
      description="Representación ilustrativa, sin datos geográficos externos."
      action={
        <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <MapPinned className="size-4" aria-hidden="true" />
        </span>
      }
      contentClassName="p-4"
    >
      <svg
        viewBox="0 0 760 260"
        role="img"
        aria-labelledby="panama-map-title panama-map-description"
        className="h-auto w-full rounded-xl bg-gradient-to-br from-blue-50 to-slate-50"
      >
        <title id="panama-map-title">Mapa estilizado de Panamá</title>
        <desc id="panama-map-description">
          Forma ilustrativa de Panamá con marcadores en Ciudad de Panamá, David,
          Colón y Panamá Oeste.
        </desc>
        <path
          d="M82 120c58-35 111-47 169-37 51 9 76 31 124 34 58 4 94-27 151-22 50 4 80 39 137 47l-24 33c-53-6-88-29-137-25-58 5-91 38-151 32-51-5-77-35-128-39-49-4-88 10-126 31l-15-54Z"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="3"
        />
        <path
          d="M382 121c25 4 41 0 58-7l18 42c-24 12-45 16-77 12l1-47Z"
          fill="#bfdbfe"
          opacity="0.75"
        />
        {[
          { x: 155, y: 115, label: "David" },
          { x: 433, y: 130, label: "Panamá Oeste" },
          { x: 514, y: 111, label: "Ciudad de Panamá" },
          { x: 542, y: 92, label: "Colón" },
        ].map((marker) => (
          <g key={marker.label}>
            <circle
              cx={marker.x}
              cy={marker.y}
              r="16"
              fill="#2563eb"
              opacity="0.14"
            />
            <circle
              cx={marker.x}
              cy={marker.y}
              r="7"
              fill="#2563eb"
              stroke="white"
              strokeWidth="3"
            />
            <text
              x={marker.x}
              y={marker.y + 31}
              textAnchor="middle"
              className="fill-slate-600 text-[11px] font-semibold"
            >
              {marker.label}
            </text>
          </g>
        ))}
      </svg>
    </SectionCard>
  );
}

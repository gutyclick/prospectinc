import { z } from "zod";

import { searchSchema } from "@/lib/validation";

export const mockSearches = z.array(searchSchema).parse([
  {
    id: "search-dentistas-panama",
    query: "Clínicas dentales",
    location: "Ciudad de Panamá, Panamá",
    resultLimit: 50,
    sources: ["google-places", "instagram", "sitios-web"],
    status: "completada",
    resultsCount: 50,
    opportunitiesCount: 12,
    createdAt: "2026-07-18T14:00:00.000Z",
  },
  {
    id: "search-restaurantes-panama-oeste",
    query: "Restaurantes italianos",
    location: "Panamá Oeste, Panamá",
    resultLimit: 40,
    sources: ["instagram", "sitios-web"],
    status: "completada",
    resultsCount: 40,
    opportunitiesCount: 8,
    createdAt: "2026-07-17T16:30:00.000Z",
  },
  {
    id: "search-talleres-chiriqui",
    query: "Talleres automotrices",
    location: "David, Chiriquí",
    resultLimit: 35,
    sources: ["directorios", "sitios-web"],
    status: "analizando",
    resultsCount: 24,
    opportunitiesCount: 6,
    createdAt: "2026-07-17T13:20:00.000Z",
  },
  {
    id: "search-abogados-bogota",
    query: "Abogados para empresas",
    location: "Bogotá, Colombia",
    resultLimit: 60,
    sources: ["directorios", "sitios-web"],
    status: "completada",
    resultsCount: 60,
    opportunitiesCount: 15,
    createdAt: "2026-07-15T18:00:00.000Z",
  },
]);

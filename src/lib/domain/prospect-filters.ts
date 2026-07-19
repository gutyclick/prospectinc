import type { Prospect, WebsiteStatus } from "./models";
import {
  getProspectContactChannel,
  type ContactChannel,
} from "./prospect-presentation";

export type ProspectSort = "score-desc" | "score-asc" | "recent";

export type ProspectFilters = {
  query: string;
  niche: string;
  sort: ProspectSort;
  websiteStatus: WebsiteStatus | "todos";
  channel: ContactChannel | "todos";
  minimumScore: number;
  excludeDuplicates: boolean;
  excludeAgencies: boolean;
};

export const DEFAULT_PROSPECT_FILTERS: ProspectFilters = {
  query: "",
  niche: "todos",
  sort: "score-desc",
  websiteStatus: "todos",
  channel: "todos",
  minimumScore: 0,
  excludeDuplicates: true,
  excludeAgencies: true,
};

const websiteStatuses = new Set<WebsiteStatus>([
  "sin-sitio",
  "desactualizado",
  "solo-redes",
  "basico",
  "optimizado",
]);
const channels = new Set<ContactChannel>([
  "whatsapp",
  "correo",
  "telefono",
  "sin-contacto",
]);
const sorts = new Set<ProspectSort>(["score-desc", "score-asc", "recent"]);

export function prospectFiltersFromSearchParams(
  params: URLSearchParams,
): ProspectFilters {
  const website = params.get("web");
  const channel = params.get("canal");
  const sort = params.get("orden");
  const minimumScore = Number(params.get("puntaje") ?? 0);

  return {
    query: params.get("q") ?? "",
    niche: params.get("nicho") ?? "todos",
    sort:
      sort && sorts.has(sort as ProspectSort)
        ? (sort as ProspectSort)
        : "score-desc",
    websiteStatus:
      website && websiteStatuses.has(website as WebsiteStatus)
        ? (website as WebsiteStatus)
        : "todos",
    channel:
      channel && channels.has(channel as ContactChannel)
        ? (channel as ContactChannel)
        : "todos",
    minimumScore: Number.isFinite(minimumScore)
      ? Math.min(100, Math.max(0, minimumScore))
      : 0,
    excludeDuplicates: params.get("duplicados") !== "incluir",
    excludeAgencies: params.get("agencias") !== "incluir",
  };
}

export function prospectFiltersToSearchParams(filters: ProspectFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.niche !== "todos") params.set("nicho", filters.niche);
  if (filters.sort !== "score-desc") params.set("orden", filters.sort);
  if (filters.websiteStatus !== "todos")
    params.set("web", filters.websiteStatus);
  if (filters.channel !== "todos") params.set("canal", filters.channel);
  if (filters.minimumScore > 0)
    params.set("puntaje", String(filters.minimumScore));
  if (!filters.excludeDuplicates) params.set("duplicados", "incluir");
  if (!filters.excludeAgencies) params.set("agencias", "incluir");
  return params;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export function applyProspectFilters(
  prospects: Prospect[],
  filters: ProspectFilters,
) {
  const query = normalize(filters.query.trim());
  const seen = new Set<string>();

  return prospects
    .filter((prospect) => {
      if (
        filters.excludeAgencies &&
        normalize(prospect.niche).includes("agencia")
      )
        return false;

      const matchesQuery =
        query.length === 0 ||
        [prospect.businessName, prospect.niche, prospect.location].some(
          (value) => normalize(value).includes(query),
        );
      const matchesNiche =
        filters.niche === "todos" || prospect.niche === filters.niche;
      const matchesWebsite =
        filters.websiteStatus === "todos" ||
        prospect.websiteStatus === filters.websiteStatus;
      const matchesChannel =
        filters.channel === "todos" ||
        getProspectContactChannel(prospect) === filters.channel;

      const matchesFilters =
        matchesQuery &&
        matchesNiche &&
        matchesWebsite &&
        matchesChannel &&
        prospect.opportunityScore >= filters.minimumScore;

      if (!matchesFilters) return false;

      const duplicateKey = `${normalize(prospect.businessName)}::${normalize(prospect.location)}`;
      if (filters.excludeDuplicates && seen.has(duplicateKey)) return false;
      seen.add(duplicateKey);
      return true;
    })
    .toSorted((first, second) => {
      if (filters.sort === "score-asc")
        return first.opportunityScore - second.opportunityScore;
      if (filters.sort === "recent")
        return second.updatedAt.localeCompare(first.updatedAt);
      return second.opportunityScore - first.opportunityScore;
    });
}

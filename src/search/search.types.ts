import type { CatalogItem } from "../catalog/catalog.types.js";
import type { ResultEnrichment } from "../enrichment/enrichment.types.js";

export const SORT_OPTIONS = [
  "relevance",
  "popularity-desc",
  "popularity-asc",
  "name-asc"
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export interface SearchCriteria {
  query: string;
  category: string | null;
  sort: SortOption;
}

export interface SearchResultItem extends CatalogItem {
  enrichment: ResultEnrichment;
}

export interface SearchMeta {
  query: string;
  category: string | null;
  sort: SortOption;
  total: number;
  enrichmentFailures: number;
  durationMs: number;
  categories: readonly string[];
}

export interface SearchResponseData {
  items: SearchResultItem[];
  meta: SearchMeta;
}

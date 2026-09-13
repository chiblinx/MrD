import type { CatalogItem } from "../catalog/catalog.types.js";
import type { CatalogRepository } from "../catalog/catalog.repository.js";
import type { EnrichmentProvider } from "../enrichment/enrichment-provider.interface.js";
import type { ItemEnrichment, ResultEnrichment } from "../enrichment/enrichment.types.js";
import type {
  SearchCriteria,
  SearchResponseData,
  SearchResultItem,
  SortOption
} from "./search.types.js";

interface ScoredCatalogItem {
  item: CatalogItem;
  relevance: number;
}

export class SearchService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly enrichmentProvider: EnrichmentProvider
  ) {}

  async search(criteria: SearchCriteria): Promise<SearchResponseData> {
    const startedAt = Date.now();
    const catalog = await this.catalogRepository.findAll();
    const categories = this.getSortedCategories(catalog);
    const matchedItems = this.findMatches(catalog, criteria);
    const sortedItems = this.sortMatches(matchedItems, criteria.sort).map(
      ({ item }) => item
    );
    const enrichments = await Promise.allSettled(
      sortedItems.map((item) =>
        this.enrichmentProvider.getItemEnrichment(item.id, item.basePrice)
      )
    );

    let enrichmentFailures = 0;
    const items: SearchResultItem[] = sortedItems.map((item, index) => {
      const enrichmentResult = enrichments[index];

      if (!enrichmentResult || enrichmentResult.status === "rejected") {
        enrichmentFailures += 1;
        return {
          ...item,
          enrichment: { status: "live-info-unavailable" }
        };
      }

      return {
        ...item,
        enrichment: this.toResultEnrichment(enrichmentResult.value)
      };
    });

    return {
      items,
      meta: {
        query: criteria.query,
        category: criteria.category,
        sort: criteria.sort,
        total: items.length,
        enrichmentFailures,
        durationMs: Date.now() - startedAt,
        categories
      }
    };
  }

  async getCategories(): Promise<readonly string[]> {
    const catalog = await this.catalogRepository.findAll();
    return this.getSortedCategories(catalog);
  }

  private findMatches(
    catalog: readonly CatalogItem[],
    criteria: SearchCriteria
  ): ScoredCatalogItem[] {
    const query = this.normalise(criteria.query);

    return catalog
      .filter((item) => !criteria.category || item.category === criteria.category)
      .map((item) => ({
        item,
        relevance: this.calculateRelevance(item, query)
      }))
      .filter(({ relevance }) => query.length === 0 || relevance > 0);
  }

  private sortMatches(
    matches: ScoredCatalogItem[],
    sort: SortOption
  ): ScoredCatalogItem[] {
    return [...matches].sort((left, right) => {
      if (sort === "popularity-desc") {
        return right.item.popularity - left.item.popularity || this.compareByName(left, right);
      }

      if (sort === "popularity-asc") {
        return left.item.popularity - right.item.popularity || this.compareByName(left, right);
      }

      if (sort === "name-asc") {
        return this.compareByName(left, right);
      }

      return (
        right.relevance - left.relevance ||
        right.item.popularity - left.item.popularity ||
        this.compareByName(left, right)
      );
    });
  }

  private calculateRelevance(item: CatalogItem, query: string): number {
    if (!query) {
      return 0;
    }

    const name = this.normalise(item.name);
    const category = this.normalise(item.category);
    const description = this.normalise(item.description);

    if (name === query) {
      return 100;
    }

    if (name.startsWith(query)) {
      return 80;
    }

    if (name.includes(query)) {
      return 60;
    }

    if (category === query) {
      return 50;
    }

    if (category.includes(query)) {
      return 35;
    }

    if (description.includes(query)) {
      return 20;
    }

    return 0;
  }

  private toResultEnrichment(enrichment: ItemEnrichment): ResultEnrichment {
    if (!enrichment.available) {
      return {
        status: "unavailable",
        available: false,
        price: enrichment.price,
        deliveryEstimateMinutes: enrichment.deliveryEstimateMinutes
      };
    }

    return {
      status: "available",
      available: true,
      price: enrichment.price,
      deliveryEstimateMinutes: enrichment.deliveryEstimateMinutes
    };
  }

  private getSortedCategories(catalog: readonly CatalogItem[]): readonly string[] {
    return [...new Set(catalog.map((item) => item.category))].sort((left, right) =>
      left.localeCompare(right)
    );
  }

  private compareByName(left: ScoredCatalogItem, right: ScoredCatalogItem): number {
    return left.item.name.localeCompare(right.item.name);
  }

  private normalise(value: string): string {
    return value.trim().toLowerCase();
  }
}

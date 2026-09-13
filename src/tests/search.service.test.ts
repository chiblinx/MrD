import { describe, expect, it } from "vitest";

import type { CatalogRepository } from "../catalog/catalog.repository.js";
import type { CatalogItem } from "../catalog/catalog.types.js";
import type { EnrichmentProvider } from "../enrichment/enrichment-provider.interface.js";
import type { ItemEnrichment } from "../enrichment/enrichment.types.js";
import { SearchService } from "../search/search.service.js";
import type { SearchCriteria } from "../search/search.types.js";

const catalog: CatalogItem[] = [
  {
    id: "item-1",
    name: "Classic Beef Burger",
    description: "Flame grilled beef patty with pickles and house sauce.",
    category: "Burgers",
    basePrice: 90,
    popularity: 91
  },
  {
    id: "item-2",
    name: "Chicken Alfredo Pizza",
    description: "Creamy pizza with roasted chicken and mushrooms.",
    category: "Pizza",
    basePrice: 150,
    popularity: 84
  },
  {
    id: "item-3",
    name: "Peri-Peri Chicken Bowl",
    description: "Grilled chicken with rice, corn and cucumber salsa.",
    category: "Chicken",
    basePrice: 112,
    popularity: 88
  },
  {
    id: "item-4",
    name: "Sparkling Lemonade",
    description: "Lemon soda with mint and a bright citrus finish.",
    category: "Drinks",
    basePrice: 30,
    popularity: 76
  },
  {
    id: "item-5",
    name: "Chocolate Brownie",
    description: "Rich chocolate dessert with a soft centre.",
    category: "Desserts",
    basePrice: 45,
    popularity: 93
  }
];

const defaultCriteria: SearchCriteria = {
  query: "",
  category: null,
  sort: "relevance"
};

describe("SearchService", () => {
  it("matches free text against item names", async () => {
    const service = createService();

    const result = await service.search({
      ...defaultCriteria,
      query: "burger"
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Classic Beef Burger");
  });

  it("matches free text against category and description", async () => {
    const service = createService();

    const categoryResult = await service.search({
      ...defaultCriteria,
      query: "drinks"
    });
    const descriptionResult = await service.search({
      ...defaultCriteria,
      query: "roasted"
    });

    expect(categoryResult.items.map((item) => item.name)).toEqual([
      "Sparkling Lemonade"
    ]);
    expect(descriptionResult.items.map((item) => item.name)).toEqual([
      "Chicken Alfredo Pizza"
    ]);
  });

  it("filters by category", async () => {
    const service = createService();

    const result = await service.search({
      ...defaultCriteria,
      category: "Chicken"
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.category).toBe("Chicken");
  });

  it("sorts by supported sort options", async () => {
    const service = createService();

    const popularityDesc = await service.search({
      ...defaultCriteria,
      sort: "popularity-desc"
    });
    const nameAsc = await service.search({
      ...defaultCriteria,
      sort: "name-asc"
    });

    expect(popularityDesc.items.map((item) => item.name).slice(0, 3)).toEqual([
      "Chocolate Brownie",
      "Classic Beef Burger",
      "Peri-Peri Chicken Bowl"
    ]);
    expect(nameAsc.items.map((item) => item.name).slice(0, 3)).toEqual([
      "Chicken Alfredo Pizza",
      "Chocolate Brownie",
      "Classic Beef Burger"
    ]);
  });

  it("returns an empty result set without calling enrichment when nothing matches", async () => {
    const provider = new FakeEnrichmentProvider();
    const service = createService(provider);

    const result = await service.search({
      ...defaultCriteria,
      query: "sushi"
    });

    expect(result.items).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(provider.calls).toEqual([]);
  });

  it("searches case-insensitively", async () => {
    const service = createService();

    const result = await service.search({
      ...defaultCriteria,
      query: "BURGER"
    });

    expect(result.items.map((item) => item.name)).toEqual([
      "Classic Beef Burger"
    ]);
  });

  it("adds successful enrichment to every matched item", async () => {
    const service = createService();

    const result = await service.search({
      ...defaultCriteria,
      query: "burger"
    });

    expect(result.items[0]?.enrichment).toEqual({
      status: "available",
      available: true,
      price: 95,
      deliveryEstimateMinutes: 25
    });
  });

  it("keeps results when one enrichment call fails", async () => {
    const provider = new FakeEnrichmentProvider(new Set(["item-2"]));
    const service = createService(provider);

    const result = await service.search({
      ...defaultCriteria,
      query: "chicken",
      sort: "name-asc"
    });

    expect(result.items.map((item) => item.name)).toEqual([
      "Chicken Alfredo Pizza",
      "Peri-Peri Chicken Bowl"
    ]);
    expect(result.meta.enrichmentFailures).toBe(1);
    expect(result.items[0]?.enrichment).toEqual({
      status: "live-info-unavailable"
    });
    expect(result.items[1]?.enrichment.status).toBe("available");
  });
});

function createService(provider = new FakeEnrichmentProvider()): SearchService {
  return new SearchService(new FakeCatalogRepository(), provider);
}

class FakeCatalogRepository implements CatalogRepository {
  async findAll(): Promise<readonly CatalogItem[]> {
    return catalog;
  }
}

class FakeEnrichmentProvider implements EnrichmentProvider {
  readonly calls: string[] = [];

  constructor(private readonly failingIds = new Set<string>()) {}

  async getItemEnrichment(
    itemId: string,
    basePrice: number
  ): Promise<ItemEnrichment> {
    this.calls.push(itemId);

    if (this.failingIds.has(itemId)) {
      throw new Error("Provider failed");
    }

    return {
      available: true,
      price: basePrice + 5,
      deliveryEstimateMinutes: 25
    };
  }
}

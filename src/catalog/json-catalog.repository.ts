import { readFile } from "node:fs/promises";

import type { CatalogRepository } from "./catalog.repository.js";
import type { CatalogItem } from "./catalog.types.js";

export class JsonCatalogRepository implements CatalogRepository {
  private catalogCache: readonly CatalogItem[] | null = null;

  constructor(private readonly catalogUrl: URL) {}

  async findAll(): Promise<readonly CatalogItem[]> {
    if (this.catalogCache) {
      return this.catalogCache;
    }

    const rawCatalog = await readFile(this.catalogUrl, "utf8");
    const parsedCatalog = JSON.parse(rawCatalog) as CatalogItem[];

    this.catalogCache = parsedCatalog;
    return parsedCatalog;
  }
}

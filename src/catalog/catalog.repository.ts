import type { CatalogItem } from "./catalog.types.js";

export interface CatalogRepository {
  findAll(): Promise<readonly CatalogItem[]>;
}

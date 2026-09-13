import type { ItemEnrichment } from "./enrichment.types.js";

export interface EnrichmentProvider {
  getItemEnrichment(itemId: string, basePrice: number): Promise<ItemEnrichment>;
}

import express from "express";
import path from "node:path";

import type { CatalogRepository } from "./catalog/catalog.repository.js";
import { JsonCatalogRepository } from "./catalog/json-catalog.repository.js";
import { errorMiddleware } from "./common/middleware/error.middleware.js";
import { apiNotFoundMiddleware } from "./common/middleware/not-found.middleware.js";
import type { EnrichmentProvider } from "./enrichment/enrichment-provider.interface.js";
import { SimulatedEnrichmentProvider } from "./enrichment/simulated-enrichment.provider.js";
import { SearchController } from "./search/search.controller.js";
import { createSearchRouter } from "./search/search.routes.js";
import { SearchService } from "./search/search.service.js";

export interface AppDependencies {
  catalogRepository?: CatalogRepository;
  enrichmentProvider?: EnrichmentProvider;
  publicDir?: string;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const catalogRepository =
    dependencies.catalogRepository ??
    new JsonCatalogRepository(new URL("./catalog/catalog.json", import.meta.url));
  const enrichmentProvider =
    dependencies.enrichmentProvider ?? new SimulatedEnrichmentProvider();
  const publicDir = dependencies.publicDir ?? path.resolve(process.cwd(), "public");

  const searchService = new SearchService(catalogRepository, enrichmentProvider);
  const searchController = new SearchController(searchService);

  app.use(express.json());
  app.use("/api", createSearchRouter(searchController));
  app.use("/api", apiNotFoundMiddleware);
  app.use(express.static(publicDir));
  app.use(errorMiddleware);

  return app;
}

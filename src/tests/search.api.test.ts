import request from "supertest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";

import { createApp } from "../app.js";
import type { CatalogRepository } from "../catalog/catalog.repository.js";
import type { CatalogItem } from "../catalog/catalog.types.js";
import type { EnrichmentProvider } from "../enrichment/enrichment-provider.interface.js";
import type { ItemEnrichment } from "../enrichment/enrichment.types.js";

describe("GET /api/search", () => {
  it("returns the documented response envelope", async () => {
    const app = createApp({
      catalogRepository: new ApiCatalogRepository(),
      enrichmentProvider: new ApiEnrichmentProvider()
    });

    const response = await withLocalServer(app, (client) =>
      client
        .get("/api/search")
        .query({ q: "burger", sort: "relevance" })
        .expect(200)
    );

    expect(response.body).toMatchObject({
      data: {
        meta: {
          query: "burger",
          category: null,
          sort: "relevance",
          total: 1,
          enrichmentFailures: 0,
          categories: ["Burgers"]
        },
        items: [
          {
            id: "api-item-1",
            name: "Classic Beef Burger",
            enrichment: {
              status: "available",
              available: true,
              price: 99,
              deliveryEstimateMinutes: 30
            }
          }
        ]
      }
    });
    expect(typeof response.body.data.meta.durationMs).toBe("number");
  });

  it("returns a consistent 400 error for invalid query parameters", async () => {
    const app = createApp({
      catalogRepository: new ApiCatalogRepository(),
      enrichmentProvider: new ApiEnrichmentProvider()
    });

    const response = await withLocalServer(app, (client) =>
      client.get("/api/search").query({ sort: "price-desc" }).expect(400)
    );

    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message:
          "sort must be one of: relevance, popularity-desc, popularity-asc, name-asc."
      }
    });
  });
});

async function withLocalServer<T>(
  app: ReturnType<typeof createApp>,
  run: (client: ReturnType<typeof request>) => Promise<T>
): Promise<T> {
  const server = createServer(app);
  await listen(server);

  try {
    const address = server.address() as AddressInfo;
    return await run(request(`http://127.0.0.1:${address.port}`));
  } finally {
    await close(server);
  }
}

function listen(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

class ApiCatalogRepository implements CatalogRepository {
  async findAll(): Promise<readonly CatalogItem[]> {
    return [
      {
        id: "api-item-1",
        name: "Classic Beef Burger",
        description: "Flame grilled beef patty with house sauce.",
        category: "Burgers",
        basePrice: 89,
        popularity: 90
      }
    ];
  }
}

class ApiEnrichmentProvider implements EnrichmentProvider {
  async getItemEnrichment(): Promise<ItemEnrichment> {
    return {
      available: true,
      price: 99,
      deliveryEstimateMinutes: 30
    };
  }
}

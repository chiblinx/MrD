import type { EnrichmentProvider } from "./enrichment-provider.interface.js";
import type { ItemEnrichment } from "./enrichment.types.js";

interface SimulatedEnrichmentProviderOptions {
  minLatencyMs?: number;
  maxLatencyMs?: number;
  failureRate?: number;
}

const DEFAULT_OPTIONS: Required<SimulatedEnrichmentProviderOptions> = {
  minLatencyMs: 150,
  maxLatencyMs: 1200,
  failureRate: 0.1
};

export class SimulatedEnrichmentProvider implements EnrichmentProvider {
  private readonly options: Required<SimulatedEnrichmentProviderOptions>;

  constructor(options: SimulatedEnrichmentProviderOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async getItemEnrichment(
    _itemId: string,
    basePrice: number
  ): Promise<ItemEnrichment> {
    await this.delay(this.randomInteger(this.options.minLatencyMs, this.options.maxLatencyMs));

    if (Math.random() < this.options.failureRate) {
      throw new Error("Simulated enrichment provider failure");
    }

    const priceMultiplier = 0.92 + Math.random() * 0.2;
    const price = Math.round(basePrice * priceMultiplier * 100) / 100;

    return {
      available: Math.random() > 0.13,
      price,
      deliveryEstimateMinutes: this.randomInteger(18, 55)
    };
  }

  private delay(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

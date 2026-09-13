export interface ItemEnrichment {
  available: boolean;
  price: number;
  deliveryEstimateMinutes: number;
}

export type ResultEnrichment =
  | {
      status: "available";
      available: true;
      price: number;
      deliveryEstimateMinutes: number;
    }
  | {
      status: "unavailable";
      available: false;
      price: number;
      deliveryEstimateMinutes: number;
    }
  | {
      status: "live-info-unavailable";
    };

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  popularity: number;
  imageUrl?: string;
}

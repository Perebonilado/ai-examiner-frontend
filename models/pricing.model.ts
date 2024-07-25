export interface PricingModel {
  type: string;
  costPerMonth: number;
  currency: string;
  offers: string[];
}

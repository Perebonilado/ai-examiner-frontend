export interface PlanModel {
  type: string;
  costPerMonth: number;
  currency: string;
  offers: Offer[];
  planId: number;
}

export interface Offer {
  title: string;
  isAvailable: boolean;
}


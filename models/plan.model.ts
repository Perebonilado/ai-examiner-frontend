import { PlanInterval, RegionType } from "@/dto/plan.dto";

export interface PlanModel {
  type: string;
  costPerMonth: number;
  currency: string;
  offers: Offer[];
  planId: number;
  region: RegionType;
  interval: PlanInterval
}

export interface Offer {
  title: string;
  isAvailable: boolean;
}


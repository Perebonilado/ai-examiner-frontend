export interface PlanDto {
  planName: string;
  planId: number;
  currency: string;
  amount: number;
  description: Description[];
}

interface Description {
  title: string;
  isAvailable: boolean;
}
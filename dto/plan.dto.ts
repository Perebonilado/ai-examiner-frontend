export interface PlanDto {
  planName: string;
  planId: number;
  currency: string;
  amount: number;
  description: Description;
  interval: PlanInterval
}

export type PlanInterval =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "bianually"
  | "annually";

interface Description {
  features: {
    "Multiple choice questions": boolean;
    Flashcards: boolean;
    "Topic selection": boolean;
    "AI Discussions": boolean;
  };
  region: RegionType;
}

export type RegionType = "Africa" | "North America" | "Asia";

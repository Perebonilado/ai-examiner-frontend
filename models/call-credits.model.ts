export interface CallCreditsModel {
  remainingCreditsMs: number;
}

export interface PurchaseCallCreditsPayloadModel {
  timeMs: number;
  currency: "USD" | "NGN";
  amount: number;
}

export interface PurchaseCallCreditsModel {
  accessCode: string;
  redirectUrl: string;
}

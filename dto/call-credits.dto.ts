export interface CallCreditsDto {
  remainingCreditsMs: number;
  free: number;
  paid: number;
}

export interface PurchaseCallCreditsDto {
  data: {
    accessCode: string;
    redirectUrl: string;
    reference: string;
  };
  message: string;
  status: number;
}

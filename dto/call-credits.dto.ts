export interface CallCreditsDto {
  remainingCreditsMs: number;
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

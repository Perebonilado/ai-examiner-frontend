export interface InitiateSubscriptionDto {
  redirectUrl: string;
  accessCode: string;
  reference: string;
}

export interface CancelSubscriptionDto {
  status: boolean;
}

export interface RestartSubscriptionDto {
  status: boolean;
}

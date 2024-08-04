export interface InitiateSubscriptionPayloadModel {
  planId: string;
}

export interface InitiateSubscriptionModel {
  redirectUrl: string;
}

export interface CancelSubscriptionPayloadModel {
  subscriptionCode: string;
  emailToken: string;
}

export interface CancelSubscriptionModel {
  status: boolean;
}

export interface RestartSubscriptionPayloadModel {
  subscriptionCode: string;
  emailToken: string;
}

export interface RestartSubscriptionModel {
  status: boolean;
}

export interface SubscriptionDetailsModel {
  billing: [string, string][];
  subscription: [string, string][];
  status: "completed" | "cancelled" | "active" | "non-renewing" | "attention"
}

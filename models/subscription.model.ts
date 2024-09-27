export interface InitiateSubscriptionPayloadModel {
  planId: string;
  oneTimeSubscription: boolean;
}

export interface InitiateSubscriptionModel {
  redirectUrl: string;
  accessCode: string;
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
  status: "completed" | "cancelled" | "active" | "non-renewing" | "attention";
  subscriptionCode: string;
  emailToken: string;
  planCode: string;
  paymentMode: "Recurring Payment" | "One Time Payment" | "None";
}

export interface UpdateSubscriptionCardModel {
  redirectUrl: string;
}

export interface UpdateSubscriptionCardPayloadModel {
  subscriptionCode: string;
}

export interface InitiateSubscriptionQueryModel {
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

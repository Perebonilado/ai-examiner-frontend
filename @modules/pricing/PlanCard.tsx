import Button from "@/@shared/ui/Button";
import { useInitiateSubscriptionMutation } from "@/api-services/subscription.service";
import CheckMark from "@/icons/CheckMark";
import { PlanModel } from "@/models/plan.model";
import React, { FC, useEffect } from "react";

interface Props extends PlanModel {}

const PlanCard: FC<Props> = ({
  type,
  costPerMonth,
  currency,
  offers,
  planId,
}) => {
  const buttonTextBasedOnPlanType = new Map<string, string>([
    ["free", "Try Free Plan"],
    ["standard", "Choose Standard"],
    ["premium", "Choose Premium"],
  ]);

  const currencySignMap = new Map<string, string>([
    ["USD", "$"],
    ["NGN", "₦"],
  ]);

  const [inititateSubscription, { data }] = useInitiateSubscriptionMutation();

  useEffect(() => {
    if (data) {
      window.location.assign(data.redirectUrl);
    }
  }, [data]);

  return (
    <div className="rounded-lg w-full max-w-[280px] px-4 flex flex-col py-6 h-[450px] bg-white border border-black">
      <div style={{ flex: 1 }}>
        <p className="text-center font-bold mb-3">{type}</p>
        <p className="text-center">
          <span className="text-2xl font-bold text-[#9A67C2]">
            {currencySignMap.get(currency)}
            {costPerMonth}
          </span>
          /month
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4" style={{ flex: 3 }}>
        {offers.map((offer, idx) => {
          return (
            <div key={idx} className="flex items-center gap-2">
              <CheckMark />
              {offer}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }}>
        <Button
          title={`${buttonTextBasedOnPlanType.get(type.toLowerCase())}`}
          onClick={() => {
            inititateSubscription({ planId: `${planId}` });
          }}
          fullWidth
        />
      </div>
    </div>
  );
};

export default PlanCard;

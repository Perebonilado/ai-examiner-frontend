import Button from "@/@shared/ui/Button";
import { useInitiateSubscriptionMutation } from "@/api-services/subscription.service";
import CheckMark from "@/icons/CheckMark";
import { PlanModel } from "@/models/plan.model";
import React, { FC, useEffect } from "react";
import { useRouter } from "next/router";
import CancelIcon from "@/icons/CancelIcon";
import { useModalContext } from "@/contexts/ModalContext";
import PaymentMethodSelection from "./PaymentMethodSelection";

interface Props extends PlanModel {
  isLoggedIn: boolean;
}

const PlanCard: FC<Props> = ({
  type,
  costPerMonth,
  currency,
  offers,
  planId,
  isLoggedIn,
  interval
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

  const router = useRouter();

  useEffect(() => {
    if (data) {
      window.location.assign(data.redirectUrl);
    }
  }, [data]);

  const { setModalContent } = useModalContext();

  const handlePayWithCard = () => {
    inititateSubscription({ planId: `${planId}`, oneTimeSubscription: false });
  };

  const handlePayWithTransfer = () => {
    inititateSubscription({ planId: `${planId}`, oneTimeSubscription: true });
  };

  return (
    <div className="rounded-lg w-full max-w-[290px] px-6 flex flex-col py-6 h-[640px] bg-white shadow-lg">
      <div style={{ flex: 1 }} className="pl-8">
        <p className="font-bold mb-3 text-lg">{type}</p>
        <p>
          <span className="text-2xl font-bold text-[#9A67C2]">
            {currencySignMap.get(currency)}
            {costPerMonth.toLocaleString()}
          </span>
          /{interval === 'monthly' ? 'month' : '3 months'}
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-14" style={{ flex: 3 }}>
        <p className="text-xs font-bold">Study with:</p>
        <div className="pb-8 flex flex-col gap-3 border-b border-b-gray-200">
          {offers
            ?.filter((offer) => offer.title !== "Region")
            ?.slice(0, 4)
            .map((offer, idx) => {
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {offer.isAvailable ? <CheckMark /> : <CancelIcon />}
                  <p style={{ color: offer.isAvailable ? "black" : "#939393" }}>
                    {offer.title}
                  </p>
                </div>
              );
            })}
        </div>

        <div className="pt-4">
          <p className="text-xs font-bold">Plan limits:</p>
          <div className="mt-4 text-sm pl-6 flex flex-col gap-3">
            {type.toLowerCase() === "free" && (
              <>
                <p>
                  <span className="font-bold">2</span> practice tests per month
                </p>
                <p>
                  <span className="font-bold">40 questions</span> per test
                </p>
                <p>
                  Max file size <span className="font-bold">300mb</span>
                </p>
              </>
            )}

            {type.toLowerCase() === "standard" && (
              <>
                <p>
                  <span className="font-bold">Unlimited</span> practice tests
                </p>
                <p>
                  <span className="font-bold">20 questions</span> per test
                </p>
                <p>
                  Max file size <span className="font-bold">30mb</span>
                </p>
              </>
            )}

            {type.toLowerCase() === "premium" && (
              <>
                <p>
                  <span className="font-bold">Unlimited</span> practice tests
                </p>
                <p>
                  <span className="font-bold">40 questions</span> per test
                </p>
                <p>
                  Max file size <span className="font-bold">300mb</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} className="pt-12">
        <Button
          title={`${buttonTextBasedOnPlanType.get(type.toLowerCase())}`}
          onClick={() => {
            if (isLoggedIn) {
              if (type.toLowerCase() === "free") {
                router.push("/new-document");
              } else {
                // set modal to either pay w trnf/card
                if (currency === "NGN") {
                  setModalContent(
                    <PaymentMethodSelection
                      handleContinue={(paymentOption) => {
                        if (paymentOption === "card") {
                          handlePayWithCard();
                        } else {
                          handlePayWithTransfer();
                        }
                      }}
                    />
                  );
                } else {
                  handlePayWithCard();
                }
              }
            } else {
              router.push(
                `/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`
              );
            }
          }}
          fullWidth
        />

        <p className="text-xs text-center mt-8 h-[50px]">
          {type.toLowerCase() === "free" && <>Good for testing purposes</>}
          {type.toLowerCase() === "standard" && (
            <>Best for boosting recall and mastering exam formats and pacing</>
          )}
          {type.toLowerCase() === "premium" && (
            <>
              Perfect for strengthening retention and identifying key areas for
              improvement
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default PlanCard;

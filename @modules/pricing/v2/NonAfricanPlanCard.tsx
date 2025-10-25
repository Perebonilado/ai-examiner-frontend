import React, { FC, useEffect } from "react";
import CheckMark from "@/icons/CheckMark";
import Button from "@/@shared/ui/Button";
import { PlanModel } from "@/models/plan.model";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { useRouter } from "next/router";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import UpgradeAccountForm from "@/@shared/components/UpgradeAccountForm";
import { useModalContext } from "@/contexts/ModalContext";
import { useInitiateSubscriptionMutation } from "@/api-services/subscription.service";

interface Props extends PlanModel {
  isLoggedIn: boolean;
}

const NonAfricanPlanCard: FC<Props> = ({
  type,
  costPerMonth,
  currency,
  offers,
  planId,
  isLoggedIn,
  interval,
}) => {
  const router = useRouter();

  const [inititateSubscription, { data }] = useInitiateSubscriptionMutation();

  const { data: userData } = useGetUserProfileQuery("");

  const { setModalContent } = useModalContext();

  const handlePayWithCard = () => {
    inititateSubscription({ planId: `${planId}`, oneTimeSubscription: false });
  };

  useEffect(() => {
    if (data) {
      window.location.assign(data.redirectUrl);
    }
  }, [data]);

  return (
    <div className="w-full max-w-[350px] h-[420px] border border-[#9333EA] rounded-xl p-4 mb-4 mx-auto">
      <h3 className="text-xl font-bold mb-1">
        {type.toLowerCase() === "free"
          ? "Free"
          : interval && capitalizeFirstLetterOfEachWord(interval)}
      </h3>
      <p className="text-sm font-semibold">
        {interval === "monthly"
          ? "For an upcoming exam"
          : "For a more consistent study routine"}
      </p>

      <p className="text-4xl mt-10 font-bold text-[#9333EA]">
        {interval === "annually" && (
          <span className="text-2xl text-[#8B8B8B] line-through">$119.88</span>
        )}{" "}
        ${costPerMonth?.toLocaleString()}
        <span className="font-normal text-2xl">
          {" "}
          /{interval === "annually" ? "year" : "month"}
        </span>
      </p>

      <div className="h-[1px] bg-[#F5F5F5] w-full my-6"></div>

      <p className="font-semibold">{type.toLowerCase() === "free" ? "Limited access:": "Get full access to:"}</p>

      <ul>
        {[
          type.toLowerCase() === "free" ? "1 practice test per month" :"Unlimited practice tests",
          "Unlimited file uploads",
          "Easy Read features",
          "Ai Discussions",
        ].map((desc) => {
          return (
            <li className="text-sm my-2 flex items-center gap-2">
              <CheckMark />
              {desc}
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Button
          title={
            type.toLowerCase() === "free"
              ? "Try Free Plan"
              : interval === "annually"
              ? "Choose annual plan"
              : "Choose monthly plan"
          }
          className="!rounded-full"
          fullWidth
          onClick={() => {
            if (isLoggedIn) {
              if (userData?.role.toLowerCase() === "guest") {
                setModalContent(<UpgradeAccountForm />);
                return;
              }

              if (type.toLowerCase() === "free") {
                router.push("/new-document");
              } else {
                handlePayWithCard();
              }
            } else {
              router.push(
                `/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default NonAfricanPlanCard;

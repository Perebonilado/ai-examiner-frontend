import React, { FC, useEffect, useState } from "react";
import GetMinutesInfoCard from "./GetMinutesInfoCard";
import MinutesLeftCard from "./MinutesLeftCard";
import {
  useGetCallCreditsQuery,
  useInitiateCallCreditsPurchaseMutation,
} from "@/api-services/call-credits.service";
import Button from "@/@shared/ui/Button";
import { LookUpModel } from "@/models/look-up.model";
import { IpInfoModel, useGetUserIpInfoQuery } from "@/api-services/ip.service";
import cn from "classnames";
import AccountSection from "./AccountSection";

const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$" };

// "NGN-600000-1500" -> { currency, ms, amount }
const parseCreditOption = (value: string) => {
  const [currency, ms, amount] = value.split("-");
  return {
    currency: currency as "USD" | "NGN",
    ms: Number(ms),
    amount: Number(amount),
  };
};

const CallCreditsContainer: FC = () => {
  const { data: credits } = useGetCallCreditsQuery(undefined);
  const { data: ipDetails, isError: isIpDetailsError } =
    useGetUserIpInfoQuery("");
  const [creditPricing, setCreditPricing] = useState<LookUpModel[]>();
  const [selectedCredit, setSelectedCredit] = useState<null | {
    ms: number;
    currency: "USD" | "NGN";
    amount: number;
  }>();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [purchaseCredits, { isLoading, error, data }] =
    useInitiateCallCreditsPurchaseMutation();

  useEffect(() => {
    setCreditPricing(getCreditsBasedOnRegion(ipDetails));
  }, [ipDetails]);

  // the region's default option starts selected (as the dropdown did)
  useEffect(() => {
    const defaultOption = creditPricing?.find((o) => o.defaultSelected);
    if (defaultOption) {
      setSelectedValue(defaultOption.value);
      setSelectedCredit(parseCreditOption(defaultOption.value));
    }
  }, [creditPricing]);

  useEffect(() => {
    if (data) {
      window.location.assign(data.redirectUrl);
    }
  }, [data]);

  return (
    <AccountSection
      title="Get more minutes"
      id="acct-get-more-minutes"
      description={<GetMinutesInfoCard />}
      className="md:grid-cols-[minmax(0,1fr)_420px] md:items-start md:gap-x-14 md:gap-y-5"
    >
      <div className="rounded-xl border border-edge bg-surface shadow-xs">
        <MinutesLeftCard milliSecondsLeft={credits?.remainingCreditsMs} />

        <div className="border-t border-line px-4 pb-[18px] pt-4 md:px-[22px] md:pb-[22px] md:pt-5">
          <p className="text-[13px] font-semibold text-ink" id="topup-label">
            Select the amount to top-up
          </p>
          <div
            role="radiogroup"
            aria-labelledby="topup-label"
            className="mb-[18px] mt-2.5 flex flex-col gap-2"
          >
            {(creditPricing || []).map((option) => {
              const { currency, ms, amount } = parseCreditOption(option.value);
              const isSelected = selectedValue === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex min-h-[52px] cursor-pointer items-center rounded-[10px] border-[1.5px] px-3.5 py-3 text-sm text-body transition-colors",
                    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-bright",
                    isSelected
                      ? "border-accent bg-accent-50"
                      : "border-edge bg-surface hover:border-accent-300"
                  )}
                >
                  <input
                    type="radio"
                    name="topup"
                    className="sr-only"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => {
                      setSelectedValue(option.value);
                      setSelectedCredit(parseCreditOption(option.value));
                    }}
                  />
                  <span className="tabular-nums">
                    <b className="font-semibold text-ink">
                      {Math.round(ms / 60000)} mins
                    </b>{" "}
                    for {currencySymbols[currency] ?? `${currency} `}
                    {amount.toLocaleString("en-US")}
                  </span>
                </label>
              );
            })}
          </div>

          <Button
            title="Buy minutes"
            size="large"
            fullWidth
            onClick={() => {
              if (selectedCredit) {
                purchaseCredits({
                  amount: selectedCredit.amount,
                  currency: selectedCredit.currency,
                  timeMs: selectedCredit.ms,
                });
              }
            }}
          />
        </div>
      </div>
    </AccountSection>
  );
};

export default CallCreditsContainer;

const NairaCredits: LookUpModel[] = [
  {
    label: "10mins for ₦1500",
    value: "NGN-600000-1500",
    defaultSelected: true,
  },
  { label: "20mins for ₦3000", value: "NGN-1200000-3000" },
  { label: "30mins for ₦4500", value: "NGN-1800000-4500" },
];

const DollarCredits: LookUpModel[] = [
  { label: "10mins for $2", value: "USD-600000-2", defaultSelected: true },
  { label: "20mins for $4", value: "USD-1200000-4" },
  { label: "30mins for $6", value: "USD-1800000-6" },
];

const AfricanDollarCredits: LookUpModel[] = [
  { label: "10mins for $1", value: "USD-600000-1", defaultSelected: true },
  { label: "20mins for $2", value: "USD-1200000-2" },
  { label: "30mins for $3", value: "USD-1800000-3" },
];

const getCreditsBasedOnRegion = (ipDetails?: IpInfoModel) => {
  if (ipDetails) {
    if (ipDetails && ipDetails.timezone?.toLowerCase().includes("africa")) {
      if (ipDetails.country?.toLowerCase() === "ng") {
        return NairaCredits;
      }

      return AfricanDollarCredits;
    }

    if (ipDetails && !ipDetails.timezone?.toLowerCase().includes("africa")) {
      return DollarCredits;
    }

    return NairaCredits;
  }

  return NairaCredits;
};

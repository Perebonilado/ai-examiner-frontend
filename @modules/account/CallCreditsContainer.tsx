import React, { FC, useEffect, useState } from "react";
import GetMinutesInfoCard from "./GetMinutesInfoCard";
import MinutesLeftCard from "./MinutesLeftCard";
import {
  useGetCallCreditsQuery,
  useInitiateCallCreditsPurchaseMutation,
} from "@/api-services/call-credits.service";
import DropDown from "@/@shared/ui/Input/DropDown";
import Button from "@/@shared/ui/Button";
import { LookUpModel } from "@/models/look-up.model";
import { IpInfoModel, useGetUserIpInfoQuery } from "@/api-services/ip.service";

const CallCreditsContainer: FC = () => {
  const { data: credits } = useGetCallCreditsQuery("");
  const { data: ipDetails, isError: isIpDetailsError } =
    useGetUserIpInfoQuery("");
  const [creditPricing, setCreditPricing] = useState<LookUpModel[]>();
  const [selectedCredit, setSelectedCredit] = useState<null | {
    ms: number;
    currency: "USD" | "NGN";
    amount: number;
  }>();
  const [purchaseCredits, { isLoading, error, data }] =
    useInitiateCallCreditsPurchaseMutation();

  useEffect(() => {
    setCreditPricing(getCreditsBasedOnRegion(ipDetails));
  }, [ipDetails]);

  useEffect(()=>{
    if(data){
        window.location.assign(data.redirectUrl);
    }
  },[data])

  return (
    <div className="lg:flex">
      <div
        style={{ flex: 1 }}
        className="lg:min-h-[600px] lg:border-r max-lg:mb-10"
      >
        <div className="lg:pr-4">
          <GetMinutesInfoCard />
        </div>
      </div>
      <div style={{ flex: 1 }} className="min-h-[600px]">
        <div className="lg:pl-4 w-full lg:max-w-[500px]">
          <MinutesLeftCard milliSecondsLeft={credits?.remainingCreditsMs} />

          <div className="mt-10">
            <label className="text-sm font-semibold flex items-center gap-4">
              Select the amount to top-up{" "}
            </label>
            <DropDown
              options={(creditPricing as any) || []}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  const [currency, ms, amount] = value.split("-");
                  setSelectedCredit({
                    currency: currency as any,
                    ms: Number(ms),
                    amount: Number(amount),
                  });
                }
              }}
            />
          </div>

          <div className="flex justify-end mt-7">
            <Button
              title="Buy Minutes"
              size="large"
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
      </div>
    </div>
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

import React, { FC } from "react";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";

/* Shared identity header for the account pages: avatar, full name, email and plan badge. */

const inactivePlanStatuses = ["completed", "cancelled"];

const AccountHeader: FC = () => {
  const { data: profile } = useGetUserProfileQuery("");
  const { data: subscription } = useGetSubscriptionDetailsQuery("");

  if (!profile) return null;

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");
  const initial = (profile.firstName || profile.email || "?")
    .charAt(0)
    .toUpperCase();

  const planName = subscription?.subscription?.find(
    ([key]) => key === "Plan"
  )?.[1];
  const showPlan =
    !!planName &&
    planName !== "N/A" &&
    !inactivePlanStatuses.includes((subscription?.status || "").toLowerCase());

  return (
    <header className="flex items-center gap-3.5 border-b border-line pb-5 pt-0.5 md:gap-[18px] md:pb-7 md:pt-1">
      <span
        aria-hidden="true"
        className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-accent-100 text-xl font-bold text-accent-900 md:h-16 md:w-16 md:text-2xl"
      >
        {initial}
      </span>
      <div className="min-w-0 grow">
        <h1 className="truncate text-xl font-bold leading-[1.2] tracking-[-0.015em] text-ink md:text-2xl">
          {fullName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] text-subtle md:mt-1.5 md:text-sm">
          <span className="truncate">{profile.email}</span>
          {showPlan && (
            <>
              <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-control" />
              <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-full bg-accent-50 px-2 text-[11.5px] font-semibold text-accent-900">
                {planName} plan
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AccountHeader;

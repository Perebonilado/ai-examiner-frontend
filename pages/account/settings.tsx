import AccountSettingInformationItemContainer from "@/@modules/account/AccountSettingInformationItemContainer";
import AppHead from "@/@shared/components/AppHead";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import Button from "@/@shared/ui/Button";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import ExternalLinkIcon from "@/icons/ExternalLinkIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const Settings: NextPage = () => {
  const { data } = useGetSubscriptionDetailsQuery("");

  const activeSubscriptionStatuses = ["active", "attention"];

  return (
    <>
      <AppHead title="Account Settings" />
      <AppLayout>
        <UserManagementBar pageTitle="Account settings" />

        {data && (
          <>
            <div className="mt-8">
              <AccountSettingInformationItemContainer
                data={data.billing}
                title="Billing"
              />
            </div>

            <div className="bg-gray-300 h-[1px] my-14"></div>

            <AccountSettingInformationItemContainer
              title="Subscription"
              data={data.subscription}
            >
              {data.status ? (
                activeSubscriptionStatuses.includes(
                  data.status.toLowerCase()
                ) ? (
                  <Button title="Cancel Subscription" />
                ) : (
                  <Button title="Renew Subscription" />
                )
              ) : null}
              <Link href={"/pricing"}>
                <Button
                  title="View Pricing Plans"
                  variant="text"
                  className="!mt-6"
                  endicon={<ExternalLinkIcon />}
                />
              </Link>
            </AccountSettingInformationItemContainer>
          </>
        )}
      </AppLayout>
    </>
  );
};

export default Settings;

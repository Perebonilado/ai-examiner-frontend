import AccountSettingInformationItemContainer from "@/@modules/account/AccountSettingInformationItemContainer";
import AppHead from "@/@shared/components/AppHead";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import Button from "@/@shared/ui/Button";
import ExternalLinkIcon from "@/icons/ExternalLinkIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const Settings: NextPage = () => {
  return (
    <>
      <AppHead title="Account Settings" />
      <AppLayout>
        <UserManagementBar pageTitle="Account settings" />

        <div className="mt-8">
          <AccountSettingInformationItemContainer
            data={[
              ["Account name", "Eradiri Perebonilado"],
              ["Bank", "Guarantee Trust Bank"],
              ["Expiration Month", "07"],
              ["Expiration Year", "2025"],
              ["Last 4 digits", "**** **** **** 3456"],
            ]}
            title="Billing"
          />
        </div>

        <div className="bg-gray-300 h-[1px] my-14"></div>

        <AccountSettingInformationItemContainer
          title="Subscription"
          data={[
            ["Account name", "Eradiri Perebonilado"],
            ["Bank", "Guarantee Trust Bank"],
            ["Expiration Month", "07"],
            ["Expiration Year", "2025"],
            ["Last 4 digits", "**** **** **** 3456"],
          ]}
        >
          <Link href={'/pricing'}>
            <Button
              title="View Pricing Plans"
              variant="text"
              className="!mb-6"
              endicon={<ExternalLinkIcon />}
            />
          </Link>
          <Button title="Cancel Subscription" />
        </AccountSettingInformationItemContainer>
      </AppLayout>
    </>
  );
};

export default Settings;

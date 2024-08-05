import AccountSettingInformationItemContainer from "@/@modules/account/AccountSettingInformationItemContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import Button from "@/@shared/ui/Button";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import { useModalContext } from "@/contexts/ModalContext";
import ExternalLinkIcon from "@/icons/ExternalLinkIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

const Settings: NextPage = () => {
  const { data, isLoading, error } = useGetSubscriptionDetailsQuery("");

  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

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

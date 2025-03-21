import AccountSettingInformationItemContainer from "@/@modules/account/AccountSettingInformationItemContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import Button from "@/@shared/ui/Button";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionDetailsQuery,
  useInitiateSubscriptionMutation,
  useRestartSubscriptionMutation,
  useUpdateCardInformationMutation,
} from "@/api-services/subscription.service";
import { useModalContext } from "@/contexts/ModalContext";
import ExternalLinkIcon from "@/icons/ExternalLinkIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import { useGetCallCreditsQuery } from "@/api-services/call-credits.service";
import { millisecondsToMinutesSeconds } from "@/utils";

const Settings: NextPage = () => {
  const { data, isLoading, error } = useGetSubscriptionDetailsQuery("");
  const { setModalContent } = useModalContext();
  const router = useRouter();

  const inactiveSubscriptionStatuses = [
    "completed",
    "cancelled",
    "attention",
    "non-renewing",
  ];
  const [cancelSubscription, { data: subCancelledData }] =
    useCancelSubscriptionMutation();
  const [updateCardDetails, { data: updateCardDetailsData }] =
    useUpdateCardInformationMutation();
  const [inititateSubscription, { data: initiateSubscriptionData }] =
    useInitiateSubscriptionMutation();
  const { data: credits } = useGetCallCreditsQuery("");

  useEffect(() => {
    if (updateCardDetailsData) {
      window.open(updateCardDetailsData.redirectUrl, "_blank");
    }
  }, [updateCardDetailsData]);

  useEffect(() => {
    if (subCancelledData) {
      router.push("/new-document");
    }
  }, [subCancelledData]);

  useEffect(() => {
    if (initiateSubscriptionData) {
      window.location.assign(initiateSubscriptionData.redirectUrl);
    }
  }, [initiateSubscriptionData]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  return (
    <>
      <AppHead title="Account Settings" />
      <AppLayout>
        {data && (
          <>
            {data && data.paymentMode === "Recurring Payment" && (
              <div className="mt-8">
                <AccountSettingInformationItemContainer
                  data={data.billing}
                  title="Billing"
                />
              </div>
            )}

            {data && data.paymentMode === "Recurring Payment" && (
              <div className="bg-gray-300 h-[1px] my-14"></div>
            )}

            <AccountSettingInformationItemContainer
              title="Subscription"
              data={data.subscription}
            >
              {data.status && data.paymentMode === "Recurring Payment" && (
                <Button
                  title="Update Card Information"
                  onClick={() => {
                    updateCardDetails({
                      subscriptionCode: data.subscriptionCode,
                    });
                  }}
                  className="mb-6"
                />
              )}

              <Link href={"/pricing"}>
                <Button
                  title="View Pricing Plans"
                  variant="text"
                  className="!mb-6"
                  endicon={<ExternalLinkIcon />}
                />
              </Link>

              {data.status &&
                data.status !== "non-renewing" &&
                data.paymentMode === "Recurring Payment" &&
                !inactiveSubscriptionStatuses.includes(
                  data.status.toLowerCase()
                ) && (
                  <div className="mt-3">
                    <Button
                      variant="outlined"
                      title="Cancel Subscription"
                      onClick={() => {
                        cancelSubscription({
                          emailToken: data.emailToken,
                          subscriptionCode: data.subscriptionCode,
                        });
                      }}
                    />
                  </div>
                )}

              {data.status && data.paymentMode === "One Time Payment" && (
                <div className="mt-3">
                  <Button
                    variant="contained"
                    title="Cancel Plan"
                    onClick={() => {
                      setModalContent(
                        <ConfirmationDialog
                          title="Discontinue Plan?"
                          message="You will lose access to the features on your current plan."
                          confirmationText="Proceed"
                          onConfirm={() => {
                            cancelSubscription({
                              emailToken: "",
                              subscriptionCode: "",
                            });
                          }}
                        />
                      );
                    }}
                  />
                </div>
              )}
            </AccountSettingInformationItemContainer>

            {credits && (
              <div className="mt-8">
                <AccountSettingInformationItemContainer
                  title="Call Credits"
                  data={[
                    [
                      "Time Remaining",
                      `${millisecondsToMinutesSeconds(
                        credits.remainingCreditsMs || 0
                      )} Minutes`,
                    ],
                  ]}
                >
                  <Link href={"/account/call-credits"}>
                    <Button
                      title="Check credit options"
                      variant="text"
                      className="!mb-6"
                      endicon={<ExternalLinkIcon />}
                    />
                  </Link>
                </AccountSettingInformationItemContainer>
              </div>
            )}
          </>
        )}
      </AppLayout>
    </>
  );
};

export default Settings;

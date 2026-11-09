import AccountSettingInformationItemContainer from "@/@modules/account/AccountSettingInformationItemContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import AccountHeader from "@/@modules/account/AccountHeader";
import Button from "@/@shared/ui/Button";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionDetailsQuery,
  useInitiateSubscriptionMutation,
  useRestartSubscriptionMutation,
  useUpdateCardInformationMutation,
} from "@/api-services/subscription.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import AccountSection from "@/@modules/account/AccountSection";
import ThemeSwitcher from "@/@shared/components/ThemeSwitcher";
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
  const { data: credits } = useGetCallCreditsQuery(undefined);

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

  const isRecurring = data?.paymentMode === "Recurring Payment";

  return (
    <>
      <AppHead title="Account Settings" />
      <AppLayout mobileTitle="Settings">
        <div className="mx-auto w-full max-w-[1000px]">
          <AccountHeader />
          <AccountSection
            title="Appearance"
            id="acct-appearance"
            description={
              <p className="mt-1.5 text-sm leading-[1.5] text-subtle">
                System follows your device&rsquo;s light or dark setting.
              </p>
            }
          >
            <ThemeSwitcher />
          </AccountSection>

          {data && (
            <>
              {isRecurring && (
                <AccountSettingInformationItemContainer
                  data={data.billing}
                  title="Billing"
                />
              )}

              <AccountSettingInformationItemContainer
                title="Subscription"
                data={data.subscription}
              >
                {data.status &&
                  data.status !== "non-renewing" &&
                  isRecurring &&
                  !inactiveSubscriptionStatuses.includes(
                    data.status.toLowerCase()
                  ) && (
                    <Button
                      variant="outlined"
                      title="Cancel subscription"
                      className={dangerButton}
                      onClick={() => {
                        cancelSubscription({
                          emailToken: data.emailToken,
                          subscriptionCode: data.subscriptionCode,
                        });
                      }}
                    />
                  )}

                {data.status && data.paymentMode === "One Time Payment" && (
                  <Button
                    variant="outlined"
                    title="Cancel plan"
                    className={dangerButton}
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
                )}

                <Link href={"/pricing"} className="max-md:w-full">
                  <Button
                    title="View pricing plans"
                    variant="outlined"
                    className="max-md:w-full"
                  />
                </Link>

                {data.status && isRecurring && (
                  <Button
                    title="Update card information"
                    onClick={() => {
                      updateCardDetails({
                        subscriptionCode: data.subscriptionCode,
                      });
                    }}
                  />
                )}
              </AccountSettingInformationItemContainer>

              {credits && (
                <AccountSettingInformationItemContainer
                  title="Call credits"
                  data={[
                    [
                      "Total time remaining",
                      `${millisecondsToMinutesSeconds(
                        credits.remainingCreditsMs || 0
                      )} minutes`,
                    ],
                    [
                      "Purchased time",
                      `${millisecondsToMinutesSeconds(
                        credits.paid || 0
                      )} minutes`,
                    ],
                    [
                      "Free time",
                      `${millisecondsToMinutesSeconds(
                        credits.free || 0
                      )} minutes`,
                    ],
                  ]}
                >
                  <Link href={"/account/call-credits"} className="max-md:w-full">
                    <Button
                      title="Check credit options"
                      variant="outlined"
                      className="max-md:w-full"
                    />
                  </Link>
                </AccountSettingInformationItemContainer>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </>
  );
};

// Destructive action: white with a red hairline, first in the footer row (last on phones)
const dangerButton =
  "!border-danger-line !text-danger hover:!bg-danger-bg md:mr-auto";

export default Settings;

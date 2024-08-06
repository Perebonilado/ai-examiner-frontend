import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import { useState, useEffect, FC } from "react";
import Link from "next/link";

const PaymentConfirmationContainer: FC = () => {
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(true);
  const [paymentConfirmationMessage, setPaymentConfirmationMessage] =
    useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [stopPolling, setStopPolling] = useState(false);

  const [subscriptionPollCount, setSubscriptionPollCount] = useState(0);
  const maxPollCount = 40;
  const pollIntervalTimeMs = 300;

  const { data } = useGetSubscriptionDetailsQuery("", {
    pollingInterval: pollIntervalTimeMs,
    skip: stopPolling,
  });

  let interval: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (data && data.status === "active") {
      setStopPolling(true);
      setIsConfirmingPayment(false);
      setPaymentConfirmationMessage("Payment Successful");
      if (interval) clearInterval(interval);
    }
  }, [data]);

  useEffect(() => {
    if (subscriptionPollCount > maxPollCount) {
      setStopPolling(true);
      setPaymentError(true);
      setPaymentConfirmationMessage(
        "An error occurred while processing your payment, please retry."
      );
    }
  }, [subscriptionPollCount]);

  useEffect(() => {
    interval = setInterval(() => {
      setSubscriptionPollCount((prevCount) => prevCount + 1);
    }, pollIntervalTimeMs);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollIntervalTimeMs]);

  return (
    <section className="bg-[#FAFAFA]">
      <Container>
        <div className="min-h-[80vh] py-20">
          {isConfirmingPayment && (
            <>
              <h2 className="text-lg font-medium text-center">
                Hold on while we confirm your payment
              </h2>
              <div className="flex items-center justify-center mt-4">
                <Spinner />
              </div>
            </>
          )}

          {!isConfirmingPayment && paymentError && (
            <div className="flex flex-col gap-1 items-center justify-center">
              <h2 className="text-lg font-medium text-center text-rose-700">
                An error occurred with your payment
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <Link href={"/pricing"}>
                <Button title="Retry" />
              </Link>
            </div>
          )}

          {!isConfirmingPayment && !paymentError && (
            <div className="flex flex-col gap-1 items-center justify-center">
              <h2 className="text-lg font-medium text-center text-green-600">
                Payment Successful
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <Link href={"/new-document"}>
                <Button title="Proceed" />
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PaymentConfirmationContainer;

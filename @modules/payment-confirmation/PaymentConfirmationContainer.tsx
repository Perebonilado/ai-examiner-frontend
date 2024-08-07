import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import { useState, useEffect, useRef, FC } from "react";
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

  // Using useRef to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data } = useGetSubscriptionDetailsQuery("", {
    pollingInterval: pollIntervalTimeMs,
    skip: stopPolling,
  });

  useEffect(() => {
    if (data && data.status === "active") {
      setStopPolling(true);
      setIsConfirmingPayment(false);
      setPaymentConfirmationMessage("Your payment has been processed.");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [data]);

  useEffect(() => {
    if (subscriptionPollCount > maxPollCount) {
      setStopPolling(true);
      setPaymentError(true);
      setPaymentConfirmationMessage(
        "An error occurred while processing your payment, please retry."
      );
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [subscriptionPollCount]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSubscriptionPollCount((prevCount) => prevCount + 1);
    }, pollIntervalTimeMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-medium text-center text-rose-700">
                An error occurred with your payment
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <Link href={"/pricing"}>
                <Button title="Retry" size="large"/>
              </Link>
            </div>
          )}

          {!isConfirmingPayment && !paymentError && (
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-medium text-center text-green-600">
                Payment Successful
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <Link href={"/new-document"}>
                <Button title="Proceed" size="large"/>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PaymentConfirmationContainer;

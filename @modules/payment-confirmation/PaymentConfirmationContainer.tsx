import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import { useState, useEffect, useRef, FC } from "react";
import Link from "next/link";
import PatternsBg from "@/@shared/components/PatternsBg";

const PaymentConfirmationContainer: FC = () => {
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(true);
  const [paymentConfirmationMessage, setPaymentConfirmationMessage] =
    useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [stopPolling, setStopPolling] = useState(false);
  const [subscriptionPollCount, setSubscriptionPollCount] = useState(0);

  const maxPollCount = 400;
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
      setPaymentConfirmationMessage(
        "You're now ready to dive into the application"
      );
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
        "Please, check your email for further details or try again"
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
    <section className="bg-[#FAFAFA] min-h-[80vh] flex flex-col justify-between">
      <Container>
        <div className="py-20">
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
                Your payment could not be processed
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <div className="mt-10 bg-white p-10 rounded-xl border border-gray-500">
                <Link href={"/pricing"}>
                  <Button title="Retry payment" size="large" />
                </Link>
              </div>
            </div>
          )}

          {!isConfirmingPayment && !paymentError && (
            <div className="flex flex-col gap-4 items-center justify-center">
              <h2 className="text-3xl font-medium text-center text-[#36CE10]">
                Your payment was successful!
              </h2>
              <p>{paymentConfirmationMessage}</p>

              <div className="mt-10 bg-white p-10 rounded-xl border border-gray-500">
                <Link href={"/new-document"}>
                  <Button title="Get Started" size="large" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
      <PatternsBg />
    </section>
  );
};

export default PaymentConfirmationContainer;

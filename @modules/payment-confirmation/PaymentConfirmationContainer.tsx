import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetSubscriptionDetailsQuery } from "@/api-services/subscription.service";
import { useState, useEffect, useRef, FC } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";

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

  const handleGetStarted = () => {
    window.location.pathname = "/new-document";
  };

  return (
    <section className="bg-canvas min-h-[80vh] flex flex-col justify-between">
      <Container>
        <div className="py-20">
          {isConfirmingPayment && (
            <>
              <h2 className="text-lg font-semibold text-center text-ink">
                Hold on while we confirm your payment
              </h2>
              <div className="flex items-center justify-center mt-4">
                <svg
                  className="animate-spin"
                  width={36}
                  height={36}
                  viewBox="0 0 40 40"
                  fill="none"
                  role="status"
                  aria-label="Confirming payment"
                >
                  <circle cx="20" cy="20" r="16" strokeWidth="4" stroke="var(--sunken)" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="30 100"
                    stroke="var(--accent)"
                  />
                </svg>
              </div>
            </>
          )}

          {!isConfirmingPayment && paymentError && (
            <div className="flex flex-col gap-3 items-center justify-center text-center">
              <span className="grid place-items-center w-[52px] h-[52px] mb-1 rounded-full bg-danger-bg text-danger">
                <CircleAlert size={22} strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
                Your payment could not be processed
              </h2>
              <p className="text-[15px] text-subtle">{paymentConfirmationMessage}</p>
              <div className="mt-6">
                <Link href={"/pricing"}>
                  <Button title="Retry payment" size="large" />
                </Link>
              </div>
            </div>
          )}

          {!isConfirmingPayment && !paymentError && (
            <div className="flex flex-col gap-3 items-center justify-center text-center">
              <span className="grid place-items-center w-[52px] h-[52px] mb-1 rounded-full bg-success-bg text-success">
                <CircleCheck size={22} strokeWidth={1.75} aria-hidden />
              </span>
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
                Your payment was successful!
              </h2>
              <p className="text-[15px] text-subtle">{paymentConfirmationMessage}</p>

              <div className="mt-6">
                <Button
                  title="Get started"
                  size="large"
                  onClick={handleGetStarted}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PaymentConfirmationContainer;

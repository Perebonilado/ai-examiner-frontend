import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { API_BASE_URL } from "@/constants";
import { NotificationModel } from "@/models/notification.model";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io(API_BASE_URL, { autoConnect: false });

const PaymentConfirmationContainer: FC = () => {
  const { data } = useGetUserProfileQuery("");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(true);
  const [paymentConfirmationMessage, setPaymentConfirmationMessage] =
    useState("");
  const [paymentError, setPaymentError] = useState(false);

  const getEventName = (userEmail: string) => {
    return `notification-${userEmail}`;
  };

  const onEventReceived = (message: NotificationModel) => {
    if (message.status === "successful") {
      toast.success(message.message);
      setIsConfirmingPayment(false);
      setPaymentError(false);
    } else {
      toast.error(message.status);
      setIsConfirmingPayment(false);
      setPaymentError(true);
    }
  };

  useEffect(() => {
    if (data) {
      socket.connect();

      const eventName = getEventName(data.email);

      socket.on(eventName, onEventReceived);
    }

    return () => {
      if (data) {
        const eventName = getEventName(data.email);
        socket.off(eventName, onEventReceived);

        socket.disconnect();
      }
    };
  }, [data]);

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
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-medium text-center text-rose-700">
                An error occured with your payment
              </h2>
              <p>{paymentConfirmationMessage}</p>
              <Link href={"/pricing"}>
                <Button title="Retry" />
              </Link>
            </div>
          )}

          {!isConfirmingPayment && !paymentError && (
            <div className="flex flex-col gap-1">
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

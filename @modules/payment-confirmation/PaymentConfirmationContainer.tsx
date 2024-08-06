import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import { API_BASE_URL } from "@/constants";
import { NotificationModel } from "@/models/notification.model";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

const PaymentConfirmationContainer: FC = () => {
  const { data } = useGetUserProfileQuery("");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(true);
  const [paymentConfirmationMessage, setPaymentConfirmationMessage] =
    useState("");
  const [paymentError, setPaymentError] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const getEventName = (userEmail: string) => {
    return `notification-${userEmail}`;
  };

  const onEventReceived = (message: NotificationModel) => {
    console.log("listened");
    if (message.status === "successful") {
      toast.success(message.message);
      setIsConfirmingPayment(false);
      setPaymentError(false);
      setPaymentConfirmationMessage(message.message);
    } else {
      toast.error(message.message);
      setIsConfirmingPayment(false);
      setPaymentError(true);
      setPaymentConfirmationMessage(message.message);
    }
  };

  useEffect(() => {
    if (data) {
      socketRef.current = io(new URL(API_BASE_URL).origin, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.connect();

      const eventName = getEventName(data.email);

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
        if (socketRef.current) {
          socketRef.current.on(eventName, onEventReceived);
        }
      });

      socketRef.current.on("connect_error", (error: any) => {
        console.error("WebSocket connection error:", error);
        toast.error("Error connecting to server. Please try again later.");
      });

      socketRef.current.on(eventName, onEventReceived);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        if (data) {
          const eventName = getEventName(data.email);
          socketRef.current.off(eventName, onEventReceived);
        }
        socketRef.current.disconnect();
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

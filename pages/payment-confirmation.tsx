import PaymentConfirmationContainer from "@/@modules/payment-confirmation/PaymentConfirmationContainer";
import AppHead from "@/@shared/components/AppHead";
import WebLayout from "@/layouts/WebLayout";
import { NextPage } from "next";
import React from "react";

const PaymentConfirmation: NextPage = () => {
  return (
    <WebLayout>
      <AppHead title="Payment Confirmation">
        <script type="text/javascript">
          {`
          gtag('event', 'conversion', {'send_to': 'AW-17184244899/SIj6CI3i8OAaEKOJi4JA'});
          `}
        </script>
      </AppHead>
      <PaymentConfirmationContainer />
    </WebLayout>
  );
};

export default PaymentConfirmation;

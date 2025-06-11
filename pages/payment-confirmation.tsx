import PaymentConfirmationContainer from "@/@modules/payment-confirmation/PaymentConfirmationContainer";
import AppHead from "@/@shared/components/AppHead";
import Footer from "@/@shared/components/Footer";
import Navbar from "@/@shared/components/Navbar";
import { NextPage } from "next";
import React from "react";

const PaymentConfirmation: NextPage = () => {
  return (
    <>
      <AppHead title="Payment Confirmation">
        <script>
          {`
          <!-- Google tag (gtag.js) event -->
           gtag('event', 'purchase', {
           // <event_parameters>
             });
          `}
        </script>
      </AppHead>
      <Navbar />
      <PaymentConfirmationContainer />
      <Footer />
    </>
  );
};

export default PaymentConfirmation;

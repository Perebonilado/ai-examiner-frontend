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
        <script type="text/javascript">
          {`
          gtag('event', 'conversion', {'send_to': 'AW-17184244899/SIj6CI3i8OAaEKOJi4JA'});
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

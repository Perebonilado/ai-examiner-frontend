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
           // Insert Twitter Event ID
  twq('event', 'tw-q01qs-q02ab', {
    conversion_id: null // use this to pass a unique ID for the conversion event for deduplication (e.g. order id '1a2b3c')
  });
</script>
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

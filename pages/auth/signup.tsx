import SignUpForm from "@/@modules/auth/SignUpForm";
import AppHead from "@/@shared/components/AppHead";
import React from "react";

const SignUp = () => {
  return (
    <>
      <AppHead title="Sign Up" />
      <SignUpForm />
    </>
  );
};

export default SignUp;

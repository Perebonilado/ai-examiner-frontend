import SignUpForm from "@/@modules/auth/SignUpForm";
import AppHead from "@/@shared/components/AppHead";
import AuthLayout from "@/layouts/AuthLayout";
import React from "react";

const SignUp = () => {
  return (
    <>
      <AppHead title="Sign Up" />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
};

export default SignUp;

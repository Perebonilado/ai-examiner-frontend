import LoginForm from "@/@modules/auth/LoginForm";
import AppHead from "@/@shared/components/AppHead";
import AuthLayout from "@/layouts/AuthLayout";
import { NextPage } from "next";

const Login: NextPage = () => {
  return (
    <>
      <AppHead title="Login" />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
};

export default Login;

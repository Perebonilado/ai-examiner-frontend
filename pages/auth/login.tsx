import LoginForm from "@/@modules/auth/LoginForm";
import AppHead from "@/@shared/components/AppHead";
import { NextPage } from "next";

const Login: NextPage = () => {
  return (
    <>
      <AppHead title="Login" />
      <LoginForm />
    </>
  );
};

export default Login;

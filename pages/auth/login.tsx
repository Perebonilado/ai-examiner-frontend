import LoginForm from "@/@modules/auth/LoginForm";
import AppHead from "@/@shared/components/AppHead";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";
import { useRouter } from "next/router";

const Login: NextPage = () => {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      Cookies.set(accessToken, token);
      router.push('/dashboard')
    }
  }, [params]);
  return (
    <>
      <AppHead title="Login" />
      <LoginForm />
    </>
  );
};

export default Login;

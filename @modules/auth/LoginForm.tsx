import React, { FC, useEffect, useState } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import LoginValidation from "@/validation-schemas/LoginValidation";
import TextField from "@/@shared/ui/Input/TextField";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import Button from "@/@shared/ui/Button";
import { useLoginMutation } from "@/api-services/auth.service";
import { useModalContext } from "@/contexts/ModalContext";
import { AppLoader } from "@/@shared/components/AppLoader";
import { toast } from "react-toastify";
import { accessToken } from "@/constants";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { AppLogo } from "@/@shared/components/AppLogo";
import MessageIcon from "@/icons/MessageIcon";
import GoogleIcon from "@/icons/GoogleIcon";

const initialValues = {
  email: "",
  password: "",
};

const LoginForm: FC = () => {
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [login, { isLoading, error, data }] = useLoginMutation();
  const { setModalContent } = useModalContext();
  const router = useRouter();

  const handleSubmit = async (values: typeof initialValues) => {
    login(values);
  };

  const googleLogin = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`;
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: LoginValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      Cookies.set(accessToken, data.data.token);
      router.push("/new-document");
    }
  }, [data]);

  return (
    <div className="w-full max-w-[450px] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto flex justify-center my-12">
        <AppLogo />
      </div>

      <div className="text-center mx-auto mb-10">
        <h2 className="text-2xl font-bold">Log In</h2>
        <p className="text-[#667185] mt-4">
          Enter your credentials to access your account
        </p>
      </div>

      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-6">
            <TextField
              label="EMAIL ADDRESS"
              placeholder="Enter your email address"
              {...formik.getFieldProps("email")}
              error={formik.touched.email ? formik.errors.email : undefined}
              endicon={<MessageIcon />}
            />

            <TextField
              label="PASSWORD"
              placeholder="Enter your password"
              type={hidePassword ? "password" : "text"}
              endicon={
                hidePassword ? (
                  <CloseEyeIcon handleClick={() => setHidePassword(false)} />
                ) : (
                  <OpenEyeIcon handleClick={() => setHidePassword(true)} />
                )
              }
              {...formik.getFieldProps("password")}
              error={
                formik.touched.password ? formik.errors.password : undefined
              }
            />

            <div className="!mt-8">
              <Button title="Login" type="submit" size="large" fullWidth />
            </div>

            <div className="flex items-center gap-3">
              <span className="w-full h-[2px] bg-[#F0F2F5]"></span>
              <p className="text-[#667185]">Or</p>
              <span className="w-full h-[2px] bg-[#F0F2F5]"></span>
            </div>

            <div className="flex flex-col gap-5">
              <Button
                title="Continue with Google"
                variant="outlined"
                size="large"
                starticon={<GoogleIcon />}
                type="button"
                onClick={googleLogin}
                className="!border-[#D0D5DD] !text-[#344054]"
              />
            </div>

            <div className="flex gap-1 items-center justify-center">
              <p className="text-[#667185]"> Are you new here?</p>{" "}
              <Button
                type="button"
                title="Create Account"
                variant="text"
                onClick={() => {
                  router.push("/auth/signup");
                }}
              />
            </div>
            <div className="flex gap-1 items-center justify-center pb-10">
              <p className="text-[#667185]"> Can't remember your password?</p>{" "}
              <Button
                type="button"
                title="Reset Password"
                variant="text"
                onClick={() => {
                  router.push("/auth/forgot-password");
                }}
              />
            </div>
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default LoginForm;

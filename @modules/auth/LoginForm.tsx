import React, { FC, useEffect, useState } from "react";
import { flush, track } from "@/@shared/analytics/track";
import { useFormik, Form, FormikProvider } from "formik";
import LoginValidation from "@/validation-schemas/LoginValidation";
import TextField from "@/@shared/ui/Input/TextField";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import Button from "@/@shared/ui/Button";
import { useLoginMutation } from "@/api-services/auth.service";
import { accessToken } from "@/constants";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { AppLogo } from "@/@shared/components/AppLogo";
import MessageIcon from "@/icons/MessageIcon";
import GoogleIcon from "@/icons/GoogleIcon";
import { ResendLink } from "./CheckYourEmail";

const initialValues = {
  email: "",
  password: "",
};

const LoginForm: FC = () => {
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [login, { data, error }] = useLoginMutation();
  const unconfirmed =
    error && "data" in error && (error.data as { code?: string; email?: string } | undefined)?.code === "EMAIL_NOT_CONFIRMED"
      ? ((error.data as { email?: string }).email ?? "")
      : null;
  const router = useRouter();
  const { returnUrl } = router.query;

  const handleSubmit = async (values: typeof initialValues) => {
    login(values);
  };

  const googleLogin = async () => {
    track("signed_in", { method: "google" });
    flush(true);
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`;
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: LoginValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  useEffect(() => {
    if (data) {
      Cookies.set(accessToken, data.data.token, {
        expires: 365, 
        secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes('localhost'),
      });
      track("signed_in", { method: "email" });

      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl as string));
      } else {
        router.push("/new-document");
      }
    }
  }, [data]);

  return (
    <div className="w-full max-w-[450px] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto flex justify-center my-12">
        <AppLogo />
      </div>

      <div className="text-center mx-auto mb-10">
        <h2 className="text-2xl font-bold">Log In</h2>
        <p className="text-subtle mt-4">
          Enter your credentials to access your account
        </p>
      </div>

      {unconfirmed !== null && (
        <div role="alert" className="mb-8 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 text-center">
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] font-semibold text-ink">Confirm your email to log in</p>
            <p className="text-[14px] leading-relaxed text-subtle">
              We’ve sent a link to <b className="font-semibold text-ink break-all">{unconfirmed || formik.values.email}</b>. Tap it, then you can log in.
            </p>
          </div>
          <ResendLink email={unconfirmed || formik.values.email} />
        </div>
      )}

      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-6">
            <TextField
              label="EMAIL ADDRESS"
              type="email"
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
              <span className="w-full h-[2px] bg-line"></span>
              <p className="text-subtle">Or</p>
              <span className="w-full h-[2px] bg-line"></span>
            </div>

            <div className="flex flex-col gap-5">
              <Button
                title="Continue with Google"
                variant="outlined"
                size="large"
                starticon={<GoogleIcon />}
                type="button"
                onClick={googleLogin}
                className="!border-control !text-body"
              />
            </div>

            <div className="flex gap-1 items-center justify-center">
              <p className="text-subtle"> Are you new here?</p>{" "}
              <Button
                type="button"
                title="Create Account"
                variant="text"
                onClick={() => {
                  if (returnUrl) {
                    router.push(
                      `/auth/signup?returnUrl=${encodeURIComponent(
                        returnUrl as string
                      )}`
                    );
                  } else {
                    router.push("/auth/signup");
                  }
                }}
              />
            </div>
            <div className="flex max-sm:flex-col gap-1 items-center justify-center pb-10">
              <p className="text-subtle"> Can&rsquo;t remember your password?</p>{" "}
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

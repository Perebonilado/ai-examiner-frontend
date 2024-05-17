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
      router.push("/");
    }
  }, [data]);

  return (
    <div className="w-full max-w-[70%] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto mb-6">
        <h2 className="text-center text-xl font-semibold">Login</h2>
      </div>

      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-6">
            <TextField
              label="Email"
              placeholder="Enter your email address"
              {...formik.getFieldProps("email")}
              error={formik.touched.email ? formik.errors.email : undefined}
            />

            <TextField
              label="Password"
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
              <Button title="Login" type="submit" fullWidth />
            </div>
            <div className="flex gap-1 items-center justify-center">
              <p> Don't have an account?</p>{" "}
              <Button
                type="button"
                title="Sign up"
                variant="text"
                onClick={() => {
                  router.push("/auth/signup");
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

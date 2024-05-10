import { AppLoader } from "@/@shared/components/AppLoader";
import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import TextField from "@/@shared/ui/Input/TextField";
import { useSignUpMutation } from "@/api-services/auth.service";
import { useModalContext } from "@/contexts/ModalContext";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import { SignUpValidation } from "@/validation-schemas/SignUpValidation";
import { Form, FormikProvider, useFormik } from "formik";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { accessToken } from "@/constants";
import Cookies from "js-cookie"

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  institution: "",
};

const SignUpForm: FC = () => {
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [signUp, { isLoading, error, data }] = useSignUpMutation();
  const { setModalContent } = useModalContext();
  const router = useRouter();

  const handleSubmit = (values: typeof initialValues) => {
    signUp(values)
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignUpValidation,
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
    <div className="w-full max-w-[70%] mx-auto py-4 px-2 max-sm:max-w-full">
      <div className="mx-auto mb-6">
        <h2 className="text-center text-xl font-semibold">Sign Up</h2>
      </div>

      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-4">
            <TextField
              label="First Name"
              placeholder="Enter your first name"
              {...formik.getFieldProps("firstName")}
              error={
                formik.touched.firstName ? formik.errors.firstName : undefined
              }
            />

            <TextField
              label="Last Name"
              placeholder="Enter your last name"
              {...formik.getFieldProps("lastName")}
              error={
                formik.touched.lastName ? formik.errors.lastName : undefined
              }
            />

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

            <DropDown
              label="Institution"
              options={[
                { label: "University", value: "2", defaultSelected: true },
                { label: "High School", value: "1" },
              ]}
              {...formik.getFieldProps("institution")}
              error={
                formik.touched.institution
                  ? formik.errors.institution
                  : undefined
              }
            />

            <div className="!mt-8">
              <Button title="Sign Up" type="submit" fullWidth />
            </div>
            <div className="flex gap-1 items-center justify-center">
              <p> Already have an account?</p>{" "}
              <Button
                title="Login"
                variant="text"
                type="button"
                onClick={() => {
                  router.push("/auth/login");
                }}
              />
            </div>
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default SignUpForm;

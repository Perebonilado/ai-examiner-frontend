import { AppLogo } from "@/@shared/components/AppLogo";
import React, { FC, useState, useEffect } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import Button from "@/@shared/ui/Button";
import { ResetPasswordValidation } from "@/validation-schemas/ResetPasswordValidation";
import { useRouter } from "next/router";
import { useResetPasswordMutation } from "@/api-services/auth.service";
import { useSearchParams } from "next/navigation";
import { useModalContext } from "@/contexts/ModalContext";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";

const initialValues = {
  password: "",
  confirmPassword: "",
};

const ResetPasswordForm: FC = () => {
  const [resetPassword, { error, isLoading, isSuccess }] =
    useResetPasswordMutation();
  const queryParams = useSearchParams();
  const token = queryParams.get("token");
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState<boolean>(true);
  const [passwordMismatch, setPasswordMisMatch] = useState(false);
  const passwordMismatchErrorMessage = "Passwords do not match";
  const { setModalContent } = useModalContext();

  const router = useRouter();

  const formik = useFormik({
    initialValues,
    validationSchema: ResetPasswordValidation,
    onSubmit: (values) => {
      if (!token) {
        toast.error("No token passed");
        return;
      }

      if (formik.isValid && !passwordMismatch) {
        resetPassword({ password: values.password, token });
      }
    },
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
    if (isSuccess) {
      toast.success("Password reset successful");
      toast.success("Please login to continue")
      router.push("/auth/login");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (formik.values.password && formik.values.confirmPassword) {
      if (formik.values.password !== formik.values.confirmPassword) {
        setPasswordMisMatch(true);
      } else setPasswordMisMatch(false);
    } else setPasswordMisMatch(false);
  }, [formik.values.confirmPassword, formik.values.password]);

  return (
    <div className="w-full max-w-[450px] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto flex justify-center my-12">
        <AppLogo />
      </div>

      <div className="text-center mx-auto mb-10">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-[#667185] mt-4">Enter a new password</p>
      </div>

      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-6">
            <TextField
              label="NEW PASSWORD"
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
            <TextField
              label="CONFIRM PASSWORD"
              placeholder="Confirm password"
              type={hideConfirmPassword ? "password" : "text"}
              endicon={
                hideConfirmPassword ? (
                  <CloseEyeIcon
                    handleClick={() => setHideConfirmPassword(false)}
                  />
                ) : (
                  <OpenEyeIcon
                    handleClick={() => setHideConfirmPassword(true)}
                  />
                )
              }
              {...formik.getFieldProps("confirmPassword")}
              error={
                (formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined) || passwordMismatch
                  ? passwordMismatchErrorMessage
                  : undefined
              }
            />

            <div className="!mt-8">
              <Button title="Submit" type="submit" size="large" fullWidth />
            </div>

            <div className="flex gap-1 items-center justify-center pb-10">
              <p className="text-[#667185]">Remember your password?</p>{" "}
              <Button
                type="button"
                title="Login"
                variant="text"
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

export default ResetPasswordForm;

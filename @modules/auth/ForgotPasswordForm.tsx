import React, { FC, useEffect } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import { AppLogo } from "@/@shared/components/AppLogo";
import { ForgotPasswordValidation } from "@/validation-schemas/ForgotPasswordValidation";
import MessageIcon from "@/icons/MessageIcon";
import Button from "@/@shared/ui/Button";
import { useRouter } from "next/router";
import { useForgotPasswordMutation } from "@/api-services/auth.service";
import { toast } from "react-toastify";
import { useModalContext } from "@/contexts/ModalContext";
import { AppLoader } from "@/@shared/components/AppLoader";

const initialValues = {
  email: "",
};

const ForgotPasswordForm: FC = () => {
  const router = useRouter();

  const { setModalContent } = useModalContext();

  const [forgotPassword, { isLoading, error, isSuccess }] =
    useForgotPasswordMutation();

  const formik = useFormik({
    initialValues,
    validationSchema: ForgotPasswordValidation,
    onSubmit: (values) => {
      forgotPassword({ email: values.email });
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
      toast.success("Reset password email sent!");
      formik.resetForm();
    }
  }, [isSuccess]);

  return (
    <div className="w-full max-w-[450px] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto flex justify-center my-12">
        <AppLogo />
      </div>

      <div className="text-center mx-auto mb-10">
        <h2 className="text-2xl font-bold">Forgot Password</h2>
        <p className="text-[#667185] mt-4">
          Enter your email to reset your password
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

export default ForgotPasswordForm;

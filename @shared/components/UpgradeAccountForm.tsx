import { useUpgradeUserAccountMutation } from "@/api-services/user.service";
import { SignUpValidation } from "@/validation-schemas/SignUpValidation";
import { Form, FormikProvider, useFormik } from "formik";
import React, { FC, useEffect, useState } from "react";
import Button from "../ui/Button";
import TextField from "../ui/Input/TextField";
import { Eye, EyeOff, Mail, X } from "lucide-react";
import Cookies from "js-cookie";
import {
  guestAccessToken,
  hasUpgradedAccountInThePastToken,
} from "@/constants";
import { AppLoader } from "./AppLoader";
import { useModalContext } from "@/contexts/ModalContext";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

interface Props {
  redirectToPricingOnSuccess?: boolean;
}

const UpgradeAccountForm: FC<Props> = ({
  redirectToPricingOnSuccess = true,
}) => {
  const [upgradeAccount, { data, isLoading }] = useUpgradeUserAccountMutation();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const handleSubmit = (values: typeof initialValues) => {
    upgradeAccount(values);
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: SignUpValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  useEffect(() => {
    if (data) {
      Cookies.set(
        hasUpgradedAccountInThePastToken,
        new Date().getTime().toString(),
        {
          expires: 365,
          secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes("localhost"),
        }
      );
      Cookies.remove(guestAccessToken);

      if (redirectToPricingOnSuccess) {
        window.location.pathname = "/pricing";
      } else {
        window.location.reload()
      }
    }
  }, [data]);
  const { setModalContent } = useModalContext();
  return (
    <>
      {isLoading && (
        <AppLoader loaderMessage="One moment... upgrading your account" />
      )}
      <div
        role="dialog"
        aria-labelledby="upgrade-account-title"
        className="relative w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] overflow-y-auto mx-auto rounded-2xl border border-edge bg-surface shadow-pop px-6 pt-6 pb-6"
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
        <div className="mb-6 pr-8">
          <h2
            id="upgrade-account-title"
            className="text-xl font-bold tracking-[-0.02em] text-ink"
          >
            Upgrade account
          </h2>
          <p className="mt-1.5 text-sm text-subtle">
            Enter your credentials to upgrade your account
          </p>
        </div>

        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-4">
              <TextField
                label="First name"
                placeholder="Enter your first name"
                {...formik.getFieldProps("firstName")}
                error={
                  formik.touched.firstName ? formik.errors.firstName : undefined
                }
              />

              <TextField
                label="Last name"
                placeholder="Enter your last name"
                {...formik.getFieldProps("lastName")}
                error={
                  formik.touched.lastName ? formik.errors.lastName : undefined
                }
              />

              <TextField
                label="Email"
                type="email"
                placeholder="Enter your email address"
                {...formik.getFieldProps("email")}
                error={formik.touched.email ? formik.errors.email : undefined}
                endicon={<Mail size={18} strokeWidth={1.75} aria-hidden />}
              />

              <TextField
                label="Password"
                placeholder="Enter your password"
                type={hidePassword ? "password" : "text"}
                endicon={
                  <button
                    type="button"
                    aria-label={hidePassword ? "Show password" : "Hide password"}
                    className="grid place-items-center text-faint hover:text-ink"
                    onClick={() => setHidePassword(!hidePassword)}
                  >
                    {hidePassword ? (
                      <EyeOff size={18} strokeWidth={1.75} />
                    ) : (
                      <Eye size={18} strokeWidth={1.75} />
                    )}
                  </button>
                }
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
              />

              <div className="mt-2">
                <Button
                  title="Upgrade account"
                  size="large"
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                />
              </div>
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default UpgradeAccountForm;

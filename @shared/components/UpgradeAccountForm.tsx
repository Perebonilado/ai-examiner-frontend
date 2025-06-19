import { useUpgradeUserAccountMutation } from "@/api-services/user.service";
import { SignUpValidation } from "@/validation-schemas/SignUpValidation";
import { Form, FormikProvider, useFormik } from "formik";
import React, { FC, useEffect, useState } from "react";
import Button from "../ui/Button";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import TextField from "../ui/Input/TextField";
import MessageIcon from "@/icons/MessageIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import Cookies from "js-cookie";
import {
  guestAccessToken,
  hasUpgradedAccountInThePastToken,
} from "@/constants";
import { AppLoader } from "./AppLoader";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

const UpgradeAccountForm: FC = () => {
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
          secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes(
            "localhost"
          ),
        }
      );
      Cookies.remove(guestAccessToken);
      window.location.pathname = "/pricing";
    }
  }, [data]);
  const { setModalContent } = useModalContext();
  return (
    <>
      {isLoading && (
        <AppLoader loaderMessage="One moment... upgrading your account" />
      )}
      <div className="w-full max-w-[450px] mx-auto p-4 bg-white rounded-lg relative">
        <button
          className="absolute top-4 right-4"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
        <div className="text-center mx-auto mb-10">
          <h2 className="text-2xl font-bold">Upgrade Account</h2>
          <p className="text-[#667185] mt-4">
            Enter your credentials to upgrade your account
          </p>
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
                type="email"
                placeholder="Enter your email address"
                {...formik.getFieldProps("email")}
                error={formik.touched.email ? formik.errors.email : undefined}
                endicon={<MessageIcon />}
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
                <Button
                  title="Upgrade Account"
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

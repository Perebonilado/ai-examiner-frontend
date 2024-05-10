import React, { FC, useState } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import LoginValidation from "@/validation-schemas/LoginValidation";
import TextField from "@/@shared/ui/Input/TextField";
import CloseEyeIcon from "@/icons/CloseEyeIcon";
import OpenEyeIcon from "@/icons/OpenEyeIcon";
import Button from "@/@shared/ui/Button";

const initialValues = {
  email: "",
  password: "",
};

const LoginForm: FC = () => {
  const [hidePassword, setHidePassword] = useState<boolean>(true);

  const handleSubmit = (values: typeof initialValues) => {};

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: LoginValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  return (
    <div className="w-full max-w-[70%] mx-auto py-6 px-2 max-sm:max-w-full">
      <div className="mx-auto mb-6">
        <h2 className="text-center text-xl font-semibold">AI Examiner</h2>
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
              <Button title="Login" fullWidth/>
            </div>
          </div>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default LoginForm;

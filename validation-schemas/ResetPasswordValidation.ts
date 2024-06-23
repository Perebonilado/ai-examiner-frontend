import * as yup from "yup";

export const ResetPasswordValidation = yup.object({
  password: yup.string().required("Required"),
  confirmPassword: yup.string().required("Required"),
});

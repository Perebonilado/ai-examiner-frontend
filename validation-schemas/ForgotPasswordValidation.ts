import * as yup from "yup";

export const ForgotPasswordValidation = yup.object({
  email: yup.string().email("Please enter a valid email").required("Required"),
});

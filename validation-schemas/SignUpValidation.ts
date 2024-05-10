import * as yup from "yup";

export const SignUpValidation = yup.object({
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup.string().email('Please enter a valid email address').required("Required"),
  password: yup.string().required("Required"),
  institution: yup.string().required("Required"),
});

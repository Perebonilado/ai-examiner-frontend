import * as yup from "yup";

export const GenerateMCQValidation = yup.object({
  category: yup.string().required("Please enter a course"),
});

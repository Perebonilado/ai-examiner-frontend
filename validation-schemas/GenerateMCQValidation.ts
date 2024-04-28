import * as yup from "yup";

export const GenerateMCQValidation = yup.object({
  category: yup.string().required("Please provide a category"),
});

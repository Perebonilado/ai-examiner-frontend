import * as yup from "yup";

export const GenerateQuestionFormValidation = yup.object({
  title: yup.string().required("Required"),
  questionCount: yup.string().required("required"),
});

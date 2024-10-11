import * as yup from "yup";

export const GenerateQuestionFormValidation = yup.object({
  title: yup.string(),
  questionCount: yup.string().required("required"),
});

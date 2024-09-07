import * as yup from "yup";

export const NewMessageValidation = yup.object({
  message: yup.string().required(),
});

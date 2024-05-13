import * as yup from "yup";

export const AddTopicValidation = yup.object({
  title: yup.string().required("Topic is required"),
});

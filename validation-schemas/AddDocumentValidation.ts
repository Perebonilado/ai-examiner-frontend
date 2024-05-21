import * as yup from "yup";

export const AddDocumentValidation = yup.object({
  title: yup.string().required("Document title is required"),
});

import * as yup from "yup";

export const EditDocumentTitleValidation = yup.object({
  title: yup.string().required("Required"),
});

import * as yup from "yup";

export const CreateCourseValidation = yup.object({
  courseTitle: yup.string().required("Course title is required"),
  courseDescription: yup.string().required("Course description is required"),
});

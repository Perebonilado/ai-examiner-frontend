import React, { FC, useEffect } from "react";
import { useFormik, Form, FormikProvider } from "formik";
import { CreateCourseValidation } from "@/validation-schemas/CreateCourseValidation";
import TextField from "@/@shared/ui/Input/TextField";
import TextArea from "@/@shared/ui/Input/TextArea";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import { useCreateCourseMutation } from "@/api-services/couse.service";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";

const initialValues = {
  courseTitle: "",
  courseDescription: "",
};

const CreateCourseForm: FC = () => {
  const [createCourse, { isLoading, isSuccess, error }] =
    useCreateCourseMutation();

  const handleSubmit = (values: typeof initialValues) => {
    createCourse({
      title: values.courseTitle,
      description: values.courseDescription,
    });
  };

  const { setModalContent } = useModalContext();

  const formik = useFormik({
    initialValues,
    validationSchema: CreateCourseValidation,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course Successfully Created");
      formik.resetForm();
      setModalContent(null);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  return (
    <>
      {isLoading && <AppLoader />}
      <div className="w-full max-w-[600px] max-sm:max-w-[90vw] rounded-xl bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-center mb-6">
          Create Course
        </h2>

        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-5">
              <TextField
                label="Course Title"
                {...formik.getFieldProps("courseTitle")}
                placeholder="Enter course title"
                error={
                  formik.touched.courseTitle
                    ? formik.errors.courseTitle
                    : undefined
                }
              />

              <TextArea
                label="Course Description"
                placeholder="Enter course description"
                {...formik.getFieldProps("courseDescription")}
                rows={5}
                error={
                  formik.touched.courseDescription
                    ? formik.errors.courseDescription
                    : undefined
                }
              />

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  title="Cancel"
                  variant="outlined"
                  type="button"
                  onClick={() => {
                    setModalContent(null);
                  }}
                />
                <Button title="Submit" type="submit" />
              </div>
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default CreateCourseForm;

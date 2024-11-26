import React, { FC } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import Button from "@/@shared/ui/Button";
import TextField from "@/@shared/ui/Input/TextField";
import { EditDocumentTitleValidation } from "@/validation-schemas/EditDocumentTitleValidation";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";

interface Props {
  handleSubmit: (title: string) => void;
  documentTitle: string;
  handleClose: () => void;
}

const EditDocumentForm: FC<Props> = ({
  documentTitle,
  handleSubmit,
  handleClose,
}) => {
  const initialValues = {
    title: documentTitle,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: EditDocumentTitleValidation,
    onSubmit: (values) => {
      handleSubmit(values.title);
    },
  });

  const { setModalContent } = useModalContext();

  return (
    <div className="w-full relative overflow-hidden max-w-[400px] max-md:max-w-[350px] rounded-xl shadow-lg flex flex-col justify-center bg-white">
      <div className="flex items-center justify-between p-4 pb-2">
        <p className="font-medium text-left"></p>
        <button
          className="cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="mb-3 p-4">
        <FormikProvider value={formik}>
          <Form>
            <p className="font-bold text-xl mb-1">New Title</p>
            <TextField
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />
            <div className="mt-8 pb-2 flex justify-end gap-4">
              <Button
                title="Cancel"
                variant="outlined"
                size="medium"
                onClick={() => {
                  formik.setFieldValue("title", documentTitle);
                  handleClose();
                }}
                type="button"
              />
              <Button
                title="Submit"
                type="submit"
                variant="contained"
                size="medium"
              />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </div>
  );
};

export default EditDocumentForm;

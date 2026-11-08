import React, { FC } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import Button from "@/@shared/ui/Button";
import TextField from "@/@shared/ui/Input/TextField";
import { EditDocumentTitleValidation } from "@/validation-schemas/EditDocumentTitleValidation";
import { useModalContext } from "@/contexts/ModalContext";
import { X } from "lucide-react";

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-title-heading"
      className="w-full max-w-[420px] max-md:max-w-[92vw] relative overflow-hidden rounded-2xl bg-surface border border-edge shadow-pop"
    >
      <FormikProvider value={formik}>
        <Form>
          <div className="flex items-start gap-3 px-5 pt-5">
            <h2
              id="edit-title-heading"
              className="text-lg font-bold text-ink tracking-[-0.015em]"
            >
              New title
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="ml-auto -mt-2 -mr-2 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
              onClick={() => {
                setModalContent(null);
              }}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="px-5 pt-3 pb-5">
            <TextField
              aria-label="Document title"
              autoFocus
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />
          </div>

          <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-line bg-canvas">
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
  );
};

export default EditDocumentForm;

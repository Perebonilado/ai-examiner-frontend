import ToolTip from "@/@shared/components/ToolTip";
import DropDown from "@/@shared/ui/Input/DropDown";
import React, { FC, useEffect, useState } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import Button from "@/@shared/ui/Button";
import { useGenerateQuestionsMutation } from "@/api-services/questions.service";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";

const initialValues = {
  questionCount: "",
};

const GenerateQuestionsForm: FC = () => {
  const params = useParams();

  const [documentId, setdocumentId] = useState<string>("");

  const { setModalContent } = useModalContext();

  const [
    generateQuestions,
    {
      isLoading: generateQuestionsLoading,
      error: generateQuestionsError,
      isSuccess: generateQuestionsSuccess,
    },
  ] = useGenerateQuestionsMutation();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      generateQuestions({ documentId, questionCount: values.questionCount });
    },
  });

  useEffect(() => {
    if (generateQuestionsError && "status" in generateQuestionsError) {
      if ("data" in generateQuestionsError) {
        const { message } = generateQuestionsError.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [generateQuestionsError]);

  useEffect(() => {
    if (params) {
      setdocumentId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (generateQuestionsSuccess) {
      toast.success("Questions successfully generated");
      setModalContent(null);
    }
  }, [generateQuestionsSuccess]);

  return (
    <>
      {generateQuestionsLoading && (
        <AppLoader loaderMessage="Hang in there while we generate your questions" />
      )}
      <div className="bg-white rounded-xl shadow-xl p-4 py-12 w-full max-w-[400px] relative">
        <span
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </span>
        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-base font-semibold flex items-center gap-4">
                  Number of Questions{" "}
                  <ToolTip
                    id="q_generation"
                    message="Please note that generating more questions typically takes more time"
                  />
                </label>
                <DropDown
                  options={[
                    { label: "5", value: "5", defaultSelected: true },
                    { label: "10", value: "10" },
                    { label: "15", value: "15" },
                    { label: "20", value: "20" },
                    { label: "25", value: "25" },
                  ]}
                  {...formik.getFieldProps("questionCount")}
                  error={
                    formik.touched.questionCount
                      ? formik.errors.questionCount
                      : undefined
                  }
                />
              </div>

              <Button title="Generate" type="submit" size="large" />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default GenerateQuestionsForm;

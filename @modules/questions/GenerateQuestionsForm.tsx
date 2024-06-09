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
import ChipMultiSelect from "@/@shared/ui/Input/ChipMultiSelect";
import Switch from "@/@shared/components/Switch";
import { useGenerateDocumentTopicsMutation } from "@/api-services/document-topic.service";
import Spinner from "@/@shared/components/Spinner";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetLookUpsByTypeQuery } from "@/api-services/look-up.service";

const initialValues = {
  questionCount: "",
  questionType: "",
};

interface Props {
  topics: { label: string; value: string }[];
  fileId: string;
}

const GenerateQuestionsForm: FC<Props> = ({ topics, fileId }) => {
  const params = useParams();

  const [documentId, setdocumentId] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const { setModalContent } = useModalContext();

  const [
    generateQuestions,
    {
      isLoading: generateQuestionsLoading,
      error: generateQuestionsError,
      isSuccess: generateQuestionsSuccess,
    },
  ] = useGenerateQuestionsMutation();

  const { data: questionTypes } = useGetLookUpsByTypeQuery({ type: "question_type" });

  const [
    generateFocusAreas,
    { isLoading: focusAreasLoading, error: focusAreasError, data: focusAreas },
  ] = useGenerateDocumentTopicsMutation();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      generateQuestions({
        documentId,
        questionCount: values.questionCount,
        questionType: values.questionType,
        selectedQuestionTopics: selectedTopics,
      });
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

  useEffect(() => {
    if (isAdvanced) {
      generateFocusAreas({ fileId, documentId });
    }
  }, [isAdvanced]);

  return (
    <>
      {generateQuestionsLoading && (
        <AppLoader loaderMessage="Hang in there while we generate your questions" />
      )}
      <div className="bg-white rounded-xl shadow-xl px-16 py-14  max-md:px-8 w-full max-w-[450px] relative">
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
            <div className="flex flex-col gap-[24px]">
              <div>
                <label className="text-base font-semibold flex items-center gap-4">
                  Question Type{" "}
                  <ToolTip
                    id="q_generationuu"
                    message="Choose the type of questions you would love to generate"
                  />
                </label>
                <DropDown
                  options={questionTypes ?? []}
                  {...formik.getFieldProps("questionType")}
                  error={
                    formik.touched.questionType
                      ? formik.errors.questionType
                      : undefined
                  }
                />
              </div>

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

              <div>
                {topics.length || focusAreas?.topics.length ? (
                  <ChipMultiSelect
                    getSelectedItems={(items) => {
                      setSelectedTopics(items.map((it) => it.label));
                    }}
                    label="Choose Focus Areas"
                    options={
                      topics.length
                        ? topics
                        : focusAreas?.topics.length
                        ? focusAreas.topics
                        : []
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    {
                      <div className="flex items-center gap-3">
                        <Switch
                          disabled={false}
                          handleChecked={() => {
                            setIsAdvanced(!isAdvanced);
                          }}
                          isChecked={isAdvanced}
                          label="Advanced Preferences"
                        />
                        <ToolTip
                          id="adv"
                          message="Advanced preferences helps you generate questions from specific areas within the document"
                        />
                      </div>
                    }
                    {focusAreasLoading && isAdvanced && (
                      <div className="flex flex-col gap-2 items-center">
                        <Spinner size="sm" />
                        <p className="text-xs">
                          Loading advanced preferences...
                        </p>
                      </div>
                    )}
                    {focusAreasError && isAdvanced && (
                      <div className="flex flex-col gap-2 items-center">
                        <ErrorMessage message="An error occured while loading advanced preferences" />
                        <Button
                          title="reload advanced preferences"
                          variant="text"
                          size="small"
                          onClick={() => {
                            generateFocusAreas({ fileId, documentId });
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button title="Generate Questions" type="submit" size="large" />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default GenerateQuestionsForm;

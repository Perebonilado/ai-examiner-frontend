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
import {
  generateQustionCountOptions,
  getQuestionTypeBasedOnPermission,
} from "@/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";

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
  const [includeUseCases, setIncludeUseCases] = useState(false);

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const [
    generateQuestions,
    {
      isLoading: generateQuestionsLoading,
      error: generateQuestionsError,
      isSuccess: generateQuestionsSuccess,
    },
  ] = useGenerateQuestionsMutation();

  const { data: questionTypes } = useGetLookUpsByTypeQuery({
    type: "question_type",
  });

  const [
    generateFocusAreas,
    { isLoading: focusAreasLoading, error: focusAreasError, data: focusAreas },
  ] = useGenerateDocumentTopicsMutation();

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      if (permissions && permissions.maxGenerationReached) {
        setModalContent(<MaxGenerationModal />);
        return;
      }

      generateQuestions({
        documentId,
        questionCount: values.questionCount,
        questionType: values.questionType,
        selectedQuestionTopics: selectedTopics,
        includeUseCases
      });
    },
  });

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

  return !permissions ? null : (
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
                  Study with{" "}
                  <ToolTip
                    id="q_generationuu"
                    message="Choose the type of questions you would love to generate"
                  />
                </label>
                <DropDown
                  options={
                    getQuestionTypeBasedOnPermission(
                      permissions,
                      questionTypes
                    ) ?? []
                  }
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
                  Total questions{" "}
                  <ToolTip
                    id="q_generation"
                    message="Please note that generating more questions typically takes more time"
                  />
                </label>
                <DropDown
                  options={generateQustionCountOptions(permissions.maxQA)}
                  {...formik.getFieldProps("questionCount")}
                  error={
                    formik.touched.questionCount
                      ? formik.errors.questionCount
                      : undefined
                  }
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  disabled={false}
                  handleChecked={() => {
                    setIncludeUseCases(!includeUseCases);
                  }}
                  label="Include Case Studies"
                  isChecked={includeUseCases}
                />
                <ToolTip
                  id="use_case"
                  message="This will generate questions with real life scenarios"
                />
              </div>

              {permissions.canUseAdvancedPreferences && (
                <div>
                  {topics.length || focusAreas?.topics.length ? (
                    <ChipMultiSelect
                      getSelectedItems={(items) => {
                        setSelectedTopics(items.map((it) => it.label));
                      }}
                      label="Topics"
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
                            label="Select Topics"
                          />
                          <ToolTip
                            id="adv"
                            message="Enable to generate topics"
                          />
                        </div>
                      }
                      {focusAreasLoading && isAdvanced && (
                        <div className="flex flex-col gap-2 items-center">
                          <Spinner size="sm" />
                          <p className="text-xs">Loading topics...</p>
                        </div>
                      )}
                      {focusAreasError && isAdvanced && (
                        <div className="flex flex-col gap-2 items-center">
                          <ErrorMessage message="An error occured while loading topics" />
                          <Button
                            title="reload topics"
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
              )}

              <Button title="Generate Questions" type="submit" size="large" />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default GenerateQuestionsForm;

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
import { difficultyOptions } from "@/constants";
import { DifficultyType } from "@/models/questions.model";

const initialValues = {
  questionCount: "",
  questionType: "",
  difficulty: "",
};

interface Props {
  topics: { label: string; value: string }[];
  fileId: string;
  preSelectedTopics?: string[];
  allowTopicSelection?: boolean;
  documentIdProp?: string;
  saveSelectedTopics?: boolean;
}

const GenerateQuestionsForm: FC<Props> = ({
  topics,
  fileId,
  preSelectedTopics = [],
  allowTopicSelection = true,
  saveSelectedTopics = true,
  documentIdProp = "",
}) => {
  const params = useParams();

  const [documentId, setdocumentId] = useState<string>(documentIdProp);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    ...preSelectedTopics,
  ]);
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
      data,
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
        questionCount: values.questionCount || "5",
        questionType: values.questionType,
        selectedQuestionTopics: selectedTopics,
        includeUseCases,
        saveSelectedTopics,
        difficulty: values.difficulty as DifficultyType
      });
    },
  });

  useEffect(() => {
    if (params && !documentIdProp) {
      setdocumentId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (data) {
      toast.success("Questions successfully generated");
      window.location.href = `${window.location.origin}/questions/practise-questions/${data.type}/${data.id}`;
    }
  }, [data]);

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
      <div className="bg-white rounded-xl max-sm:max-w-[95vw] shadow-xl py-12 px-6 w-full max-w-[380px] relative">
        <span
          className="absolute top-5 right-8 cursor-pointer"
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

              {formik.values.questionType !== "6" && (
                <div>
                  <label className="text-sm font-semibold flex items-center gap-4">
                    Difficulty
                  </label>

                  <DropDown
                    options={difficultyOptions}
                    {...formik.getFieldProps("difficulty")}
                    error={
                      formik.touched.difficulty
                        ? formik.errors.difficulty
                        : undefined
                    }
                  />
                </div>
              )}

              {formik.values.questionType !== "6" && (
                <div>
                  <label className="text-base font-semibold flex items-center gap-4">
                    Total questions{" "}
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
              )}

              {formik.values.questionType == "3" && (
                <div className="flex items-center gap-3">
                  <Switch
                    disabled={false}
                    handleChecked={() => {
                      setIncludeUseCases(!includeUseCases);
                    }}
                    label="Include Case Studies"
                    isChecked={includeUseCases}
                  />
                </div>
              )}

              {permissions.canUseAdvancedPreferences && allowTopicSelection && (
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

              <div className="mx-auto mt-8">
                <Button title="Generate" type="submit" size="large" />
              </div>
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default GenerateQuestionsForm;

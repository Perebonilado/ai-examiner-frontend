import DropDown from "@/@shared/ui/Input/DropDown";
import React, { FC, useEffect, useState } from "react";
import { useFormik, FormikProvider, Form } from "formik";
import Button from "@/@shared/ui/Button";
import {
  useGenerateQuestionsMutation,
  useGenerateQuestionsV2Mutation,
} from "@/api-services/questions.service";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import { X } from "lucide-react";
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
  ] = useGenerateQuestionsV2Mutation();

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
        payload: {
          questionCount: values.questionCount
            ? Number(values.questionCount)
            : 5,
          questionType: values.questionType ? Number(values.questionType) : 3,
          selectedQuestionTopics: selectedTopics,
          includeUseCases,
          difficulty: values.difficulty as DifficultyType,
        },
        documentId,
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-test-title"
        className="relative w-full max-w-[440px] max-sm:max-w-[95vw] max-h-[94vh] overflow-y-auto rounded-2xl border border-edge bg-surface shadow-pop"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <h2
            id="generate-test-title"
            className="text-lg font-bold leading-[1.3] tracking-[-0.015em] text-ink"
          >
            Generate test
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="-mr-2 -mt-1.5 grid h-9 w-9 place-items-center rounded-lg text-subtle transition-colors hover:bg-hover hover:text-ink"
            onClick={() => {
              setModalContent(null);
            }}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <FormikProvider value={formik}>
          <Form>
            <div className="flex flex-col gap-5 px-5 pb-5 pt-[18px]">
              <div>
                <label className="text-[13px] font-semibold text-ink">
                  Study with
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
                  <label className="text-[13px] font-semibold text-ink">
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
                  <label className="text-[13px] font-semibold text-ink">
                    Total questions
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

              {["3", "7"].includes(formik.values.questionType) && (
                <div className="flex items-center gap-3">
                  <Switch
                    disabled={false}
                    handleChecked={() => {
                      setIncludeUseCases(!includeUseCases);
                    }}
                    label="Include case studies"
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
                            label="Select topics"
                          />
                        </div>
                      }
                      {focusAreasLoading && isAdvanced && (
                        <div className="flex flex-col gap-2 items-center">
                          <Spinner size="sm" />
                          <p className="text-xs text-subtle">Loading topics…</p>
                        </div>
                      )}
                      {focusAreasError && isAdvanced && (
                        <div className="flex flex-col gap-2 items-center">
                          <ErrorMessage message="An error occured while loading topics" />
                          <Button
                            title="Reload topics"
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

              {!allowTopicSelection && selectedTopics.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    Topics
                  </p>
                  <ul
                    aria-label="Selected topics"
                    className="mt-1.5 flex flex-col gap-1 text-[13px] leading-[1.45] text-subtle"
                  >
                    {selectedTopics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2.5 rounded-b-2xl border-t border-line bg-canvas px-5 py-3.5 max-sm:px-4">
              <Button
                title="Generate"
                type="submit"
                className="min-w-[140px] max-sm:flex-1"
              />
            </div>
          </Form>
        </FormikProvider>
      </div>
    </>
  );
};

export default GenerateQuestionsForm;

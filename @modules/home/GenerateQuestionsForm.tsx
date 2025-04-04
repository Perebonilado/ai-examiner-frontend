"use client";

import dynamic from "next/dynamic";
import React, { FC, useState } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import Button from "@/@shared/ui/Button";
import { useAddDocumentMutation } from "@/api-services/document.service";
import { toast } from "react-toastify";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import { GenerateQuestionFormValidation } from "@/validation-schemas/GenerateQuestionFormValidation";
import {
  useUploadFileMutation,
  useUploadFileV2Mutation,
} from "@/api-services/file-upload.service";
import Switch from "@/@shared/components/Switch";
import ChipMultiSelect from "@/@shared/ui/Input/ChipMultiSelect";
import { useGenerateDocumentTopicsMutation } from "@/api-services/document-topic.service";
import Spinner from "@/@shared/components/Spinner";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetLookUpsByTypeQuery } from "@/api-services/look-up.service";
import {
  generateQustionCountOptions,
  getFileNameWithoutExtension,
  getQuestionTypeBasedOnPermission,
  hyphenateString,
} from "@/utils";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import { useSelector } from "react-redux";
import { RootState } from "../../config/redux-config";
import { difficultyOptions } from "@/constants";
import { DifficultyType } from "@/models/questions.model";
import { useGenerateQuestionsV2Mutation } from "@/api-services/questions.service";
import Modal from "@/@shared/components/Modal";
import QuestionGenerationLoadingModal from "../questions/QuestionGenerationLoadingModal";

const UploadFileBox = dynamic(
  () => import("@/@shared/components/UploadFileBox"),
  { ssr: false }
);

const initialValues = {
  title: "",
  questionCount: "",
  questionType: "",
  difficulty: "",
};

const GenerateQuestionsForm: FC = () => {
  const formik = useFormik({
    initialValues,
    validationSchema: GenerateQuestionFormValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  const [fileId, setFileId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isTopicsSelectVisible, setIsTopicsSelectVisible] = useState(false);
  // const [isFocusAreaData, setIsFocusAreaData] = useState(false);
  const [includeUseCases, setIncludeUseCases] = useState(false);
  // const [
  //   fetchTopics,
  //   { data: topics, isLoading: topicsLoading, error: topicsError },
  // ] = useGenerateDocumentTopicsMutation();

  // useEffect(() => {
  //   if (topics) {
  //     setIsFocusAreaData(true);
  //   }
  // }, [topics]);

  const router = useRouter();

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  // const [createDocAndGenerateQuestions, { data, isLoading, error, isSuccess }] =
  //   useAddDocumentMutation();

  const [generateQuestionsV2, { isLoading, isSuccess, error, data }] =
    useGenerateQuestionsV2Mutation();

  const { data: questionTypes } = useGetLookUpsByTypeQuery({
    type: "question_type",
  });

  // const [
  //   uploadFile,
  //   {
  //     isLoading: uploadfileLoading,
  //     error: uploadFileError,
  //     data: uploadFileData,
  //   },
  // ] = useUploadFileMutation();

  const [
    uploadFileV2,
    {
      isLoading: uploadFileLoading,
      error: uploadFileError,
      data: uploadFileDataV2,
    },
  ] = useUploadFileV2Mutation();

  const allowedMimeTypes = ["docx", "doc", "pdf", "pptx", "txt", "ppt"];

  const [file, setFile] = useState<File | null>(null);

  const [documentTopics, setDocumentTopics] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedTopics, setSelectedTopics] = useState<
    { label: string; value: string }[]
  >([]);

  const handleSubmit = (values: typeof initialValues) => {
    if (!documentId || !file || !fileId) {
      toast.error("Please upload a file");
      return;
    }

    if (permissions && permissions.maxGenerationReached) {
      setModalContent(<MaxGenerationModal />);
      return;
    }

    generateQuestionsV2({
      payload: {
        title: values.title || getFileNameWithoutExtension(file.name),
        selectedQuestionTopics: selectedTopics.length
          ? selectedTopics.map((f) => f.label)
          : undefined,
        questionCount: values.questionCount ? Number(values.questionCount) : 5,
        questionType: values.questionType ? Number(values.questionType) : 3,
        includeUseCases,
        difficulty: values.difficulty as DifficultyType,
      },
      documentId,
    });
  };

  const handleFileUpload = (
    file: File,
    pages?: string,
    start?: string,
    end?: string
  ) => {
    const formData = new FormData();

    formData.append("document", file);

    uploadFileV2({ payload: formData, pages, start, end });
  };

  useEffect(() => {
    if (uploadFileDataV2) {
      setFileId(uploadFileDataV2.fileId);
      setDocumentId(uploadFileDataV2.documentId);
      const topics = Array.from(new Set(uploadFileDataV2.topics)).map((t) => {
        return {
          label: t,
          value: t,
        };
      });

      setDocumentTopics(topics);
    }
  }, [uploadFileDataV2]);

  // useEffect(() => {
  //   if (data) {
  // router.push(
  //   `/questions/practise-questions/${hyphenateString(
  //     data.type.toLowerCase()
  //   )}/${data.id}`
  // );
  //   }
  // }, [data]);

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      setShowLoader(false);
    }
  }, [error]);

  // useEffect(() => {
  //   if (isLoading) {
  //     setModalContent(<AppLoader loaderMessage="Generating questions" />);
  //   } else {
  //     setModalContent(null);
  //   }
  // }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Questions Successfully generated for document");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (uploadFileError && "status" in uploadFileError) {
      if ("data" in uploadFileError) {
        const { message } = uploadFileError.data as { message: string };
        toast.error(message);
      } else
        toast.error(
          "An error occured while uploading your file, please try again"
        );
      setFile(null);
      setFileId(null);
    }
  }, [uploadFileError]);

  useEffect(() => {
    if (!file || !fileId) {
      setIsTopicsSelectVisible(false);
      setDocumentTopics([]);
    }
  }, [file, fileId]);

  return !permissions ? null : (
    <section>
      {showLoader && (
        <Modal>
          <QuestionGenerationLoadingModal
            isComplete={isSuccess}
            summary={uploadFileDataV2?.summary || ""}
            handleStartTest={() => {
              if (!data) return;
              router.push(
                `/questions/practise-questions/${hyphenateString(
                  data.type.toLowerCase()
                )}/${data.id}`
              );
            }}
          />
        </Modal>
      )}
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-[28px] mx-auto w-full max-w-[500px] pt-2 pb-10">
            <UploadFileBox
              allowedTypes={allowedMimeTypes}
              attachedFile={file}
              handleSelectFile={(file, pages, start, end) => {
                setFile(file);
                handleFileUpload(file, pages, start, end);
              }}
              uploadLoading={uploadFileLoading}
              handleDeleteFile={() => {
                setFile(null);
                setDocumentId(null);
                if (fileId) {
                  setFileId(null);
                }
              }}
              maxFileSizeMB={permissions.maxFileSizeAllowed}
            />

            <TextField
              label="Document Title"
              placeholder="Enter the title of the document you want to upload"
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />

            <div>
              <label className="text-sm font-semibold flex items-center gap-4">
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
                <label className="text-sm font-semibold flex items-center gap-4">
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
                  disabled={!file || !fileId}
                  handleChecked={() => {
                    setIncludeUseCases(!includeUseCases);
                  }}
                  label="Include Case Studies"
                  isChecked={includeUseCases}
                />
              </div>
            )}

            {permissions.canUseAdvancedPreferences && (
              <div className="flex items-center gap-3">
                <Switch
                  disabled={!file || !fileId}
                  handleChecked={() => {
                    setIsTopicsSelectVisible(!isTopicsSelectVisible);
                    // if (!isFocusAreaData)
                    //   fetchTopics({ fileId: fileId as string });
                  }}
                  isChecked={isTopicsSelectVisible}
                  label="Select Topics"
                />
              </div>
            )}

            {fileId && isTopicsSelectVisible && (
              <ChipMultiSelect
                options={documentTopics}
                getSelectedItems={(items) => {
                  setSelectedTopics(items);
                }}
                label="Topics"
              />
            )}

            {/* {topicsLoading && isAdvanced && (
              <div className="flex flex-col gap-2 items-center">
                <Spinner size="sm" />
                <p className="text-xs">Loading topics...</p>
              </div>
            )}

            {topicsError && isAdvanced && (
              <div className="flex flex-col gap-2 items-center">
                <ErrorMessage message="An error occured while loading topics" />
                <Button
                  title="reload topics"
                  variant="text"
                  size="small"
                  onClick={() => {
                    fetchTopics({ fileId: fileId as string });
                  }}
                />
              </div>
            )} */}

            <Button
              title="Generate Questions"
              size="large"
              disabled={
                !formik.isValid ||
                !fileId ||
                !file ||
                uploadFileLoading ||
                !documentId
              }
            />
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;

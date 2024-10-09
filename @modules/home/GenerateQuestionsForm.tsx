"use client";

import dynamic from "next/dynamic";
import React, { FC, useState } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
// import UploadFileBox from "@/@shared/components/UploadFileBox";
import Button from "@/@shared/ui/Button";
import { useAddDocumentMutation } from "@/api-services/document.service";
import { toast } from "react-toastify";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useModalContext } from "@/contexts/ModalContext";
import { GenerateQuestionFormValidation } from "@/validation-schemas/GenerateQuestionFormValidation";
import ToolTip from "@/@shared/components/ToolTip";
import { useUploadFileMutation } from "@/api-services/file-upload.service";
import Switch from "@/@shared/components/Switch";
import ChipMultiSelect from "@/@shared/ui/Input/ChipMultiSelect";
import { useGenerateDocumentTopicsMutation } from "@/api-services/document-topic.service";
import Spinner from "@/@shared/components/Spinner";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetLookUpsByTypeQuery } from "@/api-services/look-up.service";
import {
  generateQustionCountOptions,
  getQuestionTypeBasedOnPermission,
  hyphenateString,
} from "@/utils";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import { useSelector } from "react-redux";
import { RootState } from "../../config/redux-config";

const UploadFileBox = dynamic(
  () => import("@/@shared/components/UploadFileBox"),
  { ssr: false }
);

const initialValues = {
  title: "",
  questionCount: "",
  questionType: "",
};

const GenerateQuestionsForm: FC = () => {
  const formik = useFormik({
    initialValues,
    validationSchema: GenerateQuestionFormValidation,
    onSubmit: (values) => handleSubmit(values),
  });

  const [fileId, setFileId] = useState<string | null>(null);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isFocusAreaData, setIsFocusAreaData] = useState(false);
  const [includeUseCases, setIncludeUseCases] = useState(false);
  const [
    fetchTopics,
    { data: topics, isLoading: topicsLoading, error: topicsError },
  ] = useGenerateDocumentTopicsMutation();

  useEffect(() => {
    if (topics) {
      setIsFocusAreaData(true);
    }
  }, [topics]);

  const router = useRouter();

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const [createDocAndGenerateQuestions, { data, isLoading, error, isSuccess }] =
    useAddDocumentMutation();

  const { data: questionTypes } = useGetLookUpsByTypeQuery({
    type: "question_type",
  });

  const [
    uploadFile,
    {
      isLoading: uploadfileLoading,
      error: uploadFileError,
      data: uploadFileData,
    },
  ] = useUploadFileMutation();

  const allowedMimeTypes = ["docx", "doc", "pdf", "pptx", "txt"];

  const [file, setFile] = useState<File | null>(null);

  const [focusAreas, setFocusAreas] = useState<
    { label: string; value: string }[]
  >([]);

  const handleSubmit = (values: typeof initialValues) => {
    if (!file || !fileId) {
      toast.error("Please upload a file");
      return;
    }

    if (permissions && permissions.maxGenerationReached) {
      setModalContent(<MaxGenerationModal />);
      return;
    }

    createDocAndGenerateQuestions({
      payload: {
        fileId: fileId,
        title: values.title,
        selectedQuestionTopics: focusAreas.length
          ? focusAreas.map((f) => f.label)
          : undefined,
        topics: topics ? topics.topics.map((t) => t.label) : undefined,
      },
      questionCount: values.questionCount,
      questionType: values.questionType,
      includeUseCases
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

    uploadFile({ payload: formData, pages, end, start });
  };

  useEffect(() => {
    if (uploadFileData) {
      setFileId(uploadFileData.fileId);
    }
  }, [uploadFileData]);

  useEffect(() => {
    if (data) {
      router.push(
        `/questions/practise-questions/${hyphenateString(
          data.type.toLowerCase()
        )}/${data.questionId}`
      );
    }
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader loaderMessage="Generating questions" />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

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
      setIsAdvanced(false);
      setFocusAreas([]);
      setIsFocusAreaData(false);
    }
  }, [file, fileId]);

  return !permissions ? null : (
    <section>
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-[28px] mx-auto w-full max-w-[500px] pt-2 pb-10">
            <TextField
              label="Document Title"
              placeholder="Enter the title of the document you want to upload"
              {...formik.getFieldProps("title")}
              error={formik.touched.title ? formik.errors.title : undefined}
            />

            <UploadFileBox
              allowedTypes={allowedMimeTypes}
              attachedFile={file}
              handleSelectFile={(file, pages, start, end) => {
                setFile(file);
                handleFileUpload(file, pages, start, end);
              }}
              uploadLoading={uploadfileLoading}
              handleDeleteFile={() => {
                setFile(null);
                if (fileId) {
                  setFileId(null);
                }
              }}
              maxFileSizeMB={permissions.maxFileSizeAllowed}
            />

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
                disabled={!file || !fileId}
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
              <div className="flex items-center gap-3">
                <Switch
                  disabled={!file || !fileId}
                  handleChecked={() => {
                    setIsAdvanced(!isAdvanced);
                    if (!isFocusAreaData)
                      fetchTopics({ fileId: fileId as string });
                  }}
                  isChecked={isAdvanced}
                  label="Select Topics"
                />

                <ToolTip id="adv" message="Enable to generate topics" />
              </div>
            )}

            {fileId && isAdvanced && !topicsLoading && topics && (
              <ChipMultiSelect
                options={topics.topics}
                getSelectedItems={(items) => {
                  setFocusAreas(items);
                }}
                label="Topics"
              />
            )}

            {topicsLoading && isAdvanced && (
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
            )}

            <Button
              title="Generate Questions"
              size="large"
              disabled={
                !formik.isValid || !fileId || !file || uploadfileLoading
              }
            />
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;

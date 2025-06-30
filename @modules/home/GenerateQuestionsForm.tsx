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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/redux-config";
import { difficultyOptions } from "@/constants";
import { DifficultyType } from "@/models/questions.model";
import { useGenerateQuestionsV2Mutation } from "@/api-services/questions.service";
import Modal from "@/@shared/components/Modal";
import QuestionGenerationLoadingModal from "../questions/QuestionGenerationLoadingModal";
import { clearMessages } from "@/features/documentChatSlice";
import { useGenerateQuestionsContext } from "@/contexts/GenerateQuestionsContext";
import { TestFormatItem } from "./TestFormatItem";
import MultipleChoiceIcon from "@/icons/MultipleChoiceIcon";
import FlashcardIcon from "@/icons/FlashcardIcon";
import MultipleTrueFalseIcon from "@/icons/MultipleTrueFalseIcon";
import TestFormatItemContainer from "./TestFormatItemContainer";
import Dialog from "@/@shared/components/Dialog";
import EssayIcon from "@/icons/EssayIcon";
import VivaIcon from "@/icons/VivaIcon";
import TotalQuestionsContainer from "./TotalQuestionsContainer";
import AdditionalSettingsIcon from "@/icons/AdditionalSettingsIcon";
import AdditionalSettingsContainer from "./AdditionalSettingsContainer";
import AltTabContainer from "@/@shared/components/Tab/AltTabContainer";
import { IAltTabItem } from "@/@shared/components/Tab/AltTabItem";
import EasyReadIcon from "@/icons/EasyReadIcon";
import SummarizeIcon from "@/icons/SummarizeIcon";

const UploadFileBox = dynamic(
  () => import("@/@shared/components/UploadFileBox"),
  { ssr: false }
);

const initialValues = {
  title: "",
  questionCount: "",
  questionType: "3",
  difficulty: "medium",
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
  const [includeUseCases, setIncludeUseCases] = useState(false);

  const router = useRouter();

  const { setModalContent } = useModalContext();
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  const {
    data,
    error,
    generateQuestionsV2,
    isLoading,
    isSuccess,
    setUploadedDocumentId,
  } = useGenerateQuestionsContext();

  const { data: questionTypes } = useGetLookUpsByTypeQuery({
    type: "question_type",
  });

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
      setUploadedDocumentId(uploadFileDataV2.documentId);
      const topics = Array.from(new Set(uploadFileDataV2.topics)).map((t) => {
        return {
          label: t,
          value: t,
        };
      });

      setDocumentTopics(topics);
    }
  }, [uploadFileDataV2]);

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

  const [isTestFormatModal, setIsTestFormatModal] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(
    (() => {
      const value = questionTypes?.find(
        (qt) => qt.value === formik.values.questionType || "3"
      )?.label as string;

      return value;
    })() || "Multiple Choice"
  );

  useEffect(() => {
    if (questionTypes)
      setSelectedQuestionType(
        (() => {
          const value = questionTypes?.find(
            (qt) => qt.value == formik.values.questionType
          )?.label as string;

          return value;
        })() || "Multiple Choice"
      );
  }, [formik.values.questionType, questionTypes]);

  const [isTotalQuestionsForm, setIsTotalQuestionsForm] = useState(false);

  const [isAdditionalSettings, setIsAdditionalSettings] = useState(false);

  const [tabs, setTabs] = useState<Omit<IAltTabItem, "handleClick">[]>([
    { isActive: true, title: "Test Mode" },
    { isActive: false, title: "Study Mode" },
  ]);
  const [activeTab, setActiveTab] = useState(
    tabs.filter((t) => t.isActive)[0].title
  );
  const [isStudyModeModal, setIsStudyModeModal] = useState(false);
  const [selectedStudyTool, setSelectedStudyTool] = useState<number>();

  useEffect(() => {
    setActiveTab(tabs.filter((t) => t.isActive)[0].title);
  }, [JSON.stringify(tabs)]);

  const handleStartStudying = () => {
    const [summary, easyRead] = studyModeFormats.map((f) => f.value);
    if (selectedStudyTool === summary) {
      router.push(`/questions/view-questions/${documentId}?tab=Summary`);
    } else if (selectedStudyTool === easyRead) {
      router.push(`/easy-read/${documentId}`);
    } else {
      router.push(
        `/questions/view-questions/${documentId}?tab=${encodeURIComponent(
          "Related Videos"
        )}`
      );
    }
  };

  return !permissions ? null : (
    <section className="min-h-[900px]">
      {isAdditionalSettings && (
        <Modal>
          <AdditionalSettingsContainer
            canUseDifficulty={formik.values.questionType !== "6"}
            handleClose={() => {
              setIsAdditionalSettings(false);
            }}
            allTopics={documentTopics.map((t) => t.label)}
            selectedTopics={selectedTopics.map((t) => t.label)}
            handleSelectTopics={(topics) => {
              setSelectedTopics(
                topics.map((t) => {
                  return { label: t, value: t.toLowerCase() };
                })
              );
            }}
            isCaseStudy={includeUseCases}
            handleCaseStudy={() => {
              setIncludeUseCases(!includeUseCases);
            }}
            canUseCaseStudy={["3", "7"].includes(formik.values.questionType)}
            selectedDifficulty={formik.values.difficulty}
            handleSelectDifficulty={(difficulty) => {
              formik.setFieldValue("difficulty", difficulty);
            }}
          />
        </Modal>
      )}
      {isTotalQuestionsForm && (
        <Modal>
          <TotalQuestionsContainer
            handleClose={() => {
              setIsTotalQuestionsForm(false);
            }}
            handleSelected={(value) => {
              formik.setFieldValue("questionCount", String(value));
            }}
            selected={Number(formik.values.questionCount) || 5}
            maxCount={permissions.maxQA}
          />
        </Modal>
      )}
      {isTestFormatModal && (
        <Modal>
          <TestFormatItemContainer
            handleClose={() => {
              setIsTestFormatModal(false);
            }}
            testFormats={testFormats}
            handleSelected={(value) => {
              formik.setFieldValue("questionType", String(value));
              setIsTestFormatModal(false);
            }}
            selected={
              formik.values.questionType
                ? Number(formik.values.questionType)
                : 3
            }
          />
        </Modal>
      )}
      {isStudyModeModal && (
        <Modal>
          <TestFormatItemContainer
            handleClose={() => {
              setIsStudyModeModal(false);
            }}
            testFormats={studyModeFormats}
            handleSelected={(value) => {
              setSelectedStudyTool(value);
              setIsStudyModeModal(false);
            }}
            selected={selectedStudyTool}
            title="Select Study Tool"
          />
        </Modal>
      )}
      <div className="my-3">
        <AltTabContainer
          data={tabs}
          handleClick={(tab) => {
            const mutatedTabs = tabs.map((t) => {
              if (t.title === tab) {
                return { ...t, isActive: true };
              }
              return { ...t, isActive: false };
            });
            setTabs(mutatedTabs);
          }}
        />
      </div>
      <FormikProvider value={formik}>
        <Form>
          <div className="flex flex-col gap-[28px] mx-auto w-full max-w-[500px] pt-2 pb-10">
            <UploadFileBox
              allowedTypes={allowedMimeTypes}
              attachedFile={file}
              disableUpload={isLoading}
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

            {activeTab === "Study Mode" && (
              <div className="w-full flex flex-col gap-6">
                <TextField
                  label="Study Tool"
                  cursorPointer={true}
                  readOnly={true}
                  value={
                    studyModeFormats.filter(
                      (m) => m.value === selectedStudyTool
                    )[0]?.title || ""
                  }
                  placeholder="Select Study Tool"
                  handleClick={() => {
                    setIsStudyModeModal(true);
                  }}
                />
                <Button
                  title="Start Studying"
                  size="large"
                  fullWidth
                  type="button"
                  disabled={
                    !fileId ||
                    !file ||
                    uploadFileLoading ||
                    !documentId ||
                    !selectedStudyTool
                  }
                  onClick={handleStartStudying}
                />
              </div>
            )}

            {activeTab === "Test Mode" && (
              <>
                <TextField
                  label="Document Title"
                  placeholder="Enter a title for your document"
                  {...formik.getFieldProps("title")}
                  error={formik.touched.title ? formik.errors.title : undefined}
                />

                <div>
                  <label className="text-sm font-semibold flex items-center gap-4">
                    Test Format{" "}
                  </label>
                  <div className="mt-2 cursor-pointer">
                    <TextField
                      label=""
                      cursorPointer={true}
                      readOnly={true}
                      value={selectedQuestionType}
                      handleClick={() => {
                        setIsTestFormatModal(true);
                      }}
                    />
                  </div>
                </div>

                {formik.values.questionType !== "6" && (
                  <div>
                    <label className="text-sm font-semibold flex items-center gap-4">
                      Total questions{" "}
                    </label>
                    <div className="mt-2 cursor-pointer">
                      <TextField
                        label=""
                        readOnly={true}
                        cursorPointer={true}
                        value={formik.values.questionCount || "5"}
                        handleClick={() => {
                          setIsTotalQuestionsForm(true);
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsAdditionalSettings(true);
                  }}
                  className="flex items-center gap-2 text-sm text-[#9333EA] font-medium"
                >
                  <AdditionalSettingsIcon /> Additional Settings
                </button>

                <Button
                  title="Generate Test"
                  size="large"
                  disabled={
                    !formik.isValid ||
                    !fileId ||
                    !file ||
                    uploadFileLoading ||
                    !documentId ||
                    isLoading
                  }
                />
              </>
            )}
          </div>
        </Form>
      </FormikProvider>
    </section>
  );
};

export default GenerateQuestionsForm;

const studyModeFormats: TestFormatItem[] = [
  {
    title: "Summarize",
    value: 1,
    description: "Get a brief summary of key points from your material",
    icon: <SummarizeIcon />,
  },
  {
    title: "Easy read",
    value: 2,
    description:
      "Simplifies each page of your material into easier-to-understand language",
    icon: <EasyReadIcon />,
    isBeta: true,
  },
  // {
  //   title: "Related Videos",
  //   value: 7,
  //   description: "Helpful videos to reinforce your understanding",
  //   icon: <EssayIcon />,
  // },
];

const testFormats: TestFormatItem[] = [
  {
    title: "Multiple Choice",
    value: 3,
    description: "Sharpen recall, solidify facts",
    icon: <MultipleChoiceIcon />,
  },
  {
    title: "Flash Cards",
    value: 4,
    description: "Master concepts in bite-sized bursts",
    icon: <FlashcardIcon />,
  },
  {
    title: "Multiple True-False",
    value: 5,
    description: "Tackle complexity with precision",
    icon: <MultipleTrueFalseIcon />,
  },
  {
    title: "Oral (viva)",
    value: 6,
    description: "Think fast, speak with clarity",
    icon: <VivaIcon />,
    isBeta: true,
  },
  {
    title: "Essay",
    value: 7,
    description: "Think deeply. Write clearly.",
    icon: <EssayIcon />,
  },
];

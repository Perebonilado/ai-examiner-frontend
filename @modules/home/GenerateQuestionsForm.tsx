"use client";

import dynamic from "next/dynamic";
import React, { FC, useState } from "react";
import { Form, useFormik, FormikProvider } from "formik";
import TextField from "@/@shared/ui/Input/TextField";
import Button from "@/@shared/ui/Button";
import {
  DocumentService,
  useAddDocumentMutation,
  useUpdateDocumentMutation,
} from "@/api-services/document.service";
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
  capitalizeFirstLetterOfEachWord,
  generateQustionCountOptions,
  getFileNameWithoutExtension,
  getQuestionTypeBasedOnPermission,
  hyphenateString,
} from "@/utils";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import { useDispatch, useSelector } from "react-redux";
import { reduxStore, RootState } from "../../config/redux-config";
import { difficultyOptions } from "@/constants";
import { DifficultyType } from "@/models/questions.model";
import { useGenerateQuestionsV2Mutation } from "@/api-services/questions.service";
import Modal from "@/@shared/components/Modal";
import QuestionGenerationLoadingModal from "../questions/QuestionGenerationLoadingModal";
import { clearMessages } from "@/features/documentChatSlice";
import { useGenerateQuestionsContext } from "@/contexts/GenerateQuestionsContext";
import { TestFormatItem } from "./TestFormatItem";
import TestFormatItemContainer from "./TestFormatItemContainer";
import Dialog from "@/@shared/components/Dialog";
import TotalQuestionsContainer from "./TotalQuestionsContainer";
import AdditionalSettingsContainer from "./AdditionalSettingsContainer";
import { IAltTabItem } from "@/@shared/components/Tab/AltTabItem";
import { TopicsV2Model } from "@/models/file-upload.model";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import PickerField from "./PickerField";
import cn from "classnames";
import {
  BookOpen,
  BookOpenText,
  ChevronRight,
  ClipboardCheck,
  Hash,
  Layers,
  ListChecks,
  ListTodo,
  Mic,
  PenLine,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";

/** "Multiple True-False" -> "Multiple true-false"; keeps words in brackets as they are. */
export const toSentenceCase = (text?: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

/* Phones: the primary action sticks to the bottom of the screen. */
const submitBarClass =
  "mt-7 max-md:mt-auto max-md:sticky max-md:bottom-0 max-md:z-[4] max-md:-mx-4 max-md:-mb-12 max-md:px-4 max-md:pt-3 max-md:pb-[calc(12px+env(safe-area-inset-bottom))] max-md:bg-white/95 max-md:backdrop-blur-sm max-md:border-t max-md:border-line";

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
  const [topicsWithPages, setTopicsWithPages] = useState<TopicsV2Model[]>([]);

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
  const [selectedTopics, setSelectedTopics] = useState<TopicsV2Model[]>([]);

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
        // selectedQuestionTopics: selectedTopics.length
        //   ? selectedTopics.map((f) => f.label)
        //   : undefined,
        selectedTopicIds: selectedTopics.map((t) => t.id),
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
      setTopicsWithPages(uploadFileDataV2.topicsWithPages);
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

  const handleStartStudying = async () => {
    const [summary, easyRead] = studyModeFormats.map((f) => f.value);
    if (
      !!permissions &&
      permissions.maxGenerationReached &&
      selectedStudyTool === easyRead
    ) {
      setModalContent(
        <MaxGenerationModal body="An upgrade is required to use Easy Read" />
      );
      return;
    }

    if (formik.values.title.trim().length) {
      setModalContent(<AppLoader loaderMessage="Loading..." />);
      const data = await reduxStore.dispatch(
        DocumentService.endpoints.updateDocument.initiate({
          id: documentId as string,
          title: formik.values.title.trim(),
        })
      );
      setModalContent(null);

      if (data.error) {
        toast.error("Oops! An error occurred updating document title");
      }
    }

    if (selectedStudyTool === summary) {
      router.push(`/questions/view-questions/${documentId}?tab=Summary`);
    } else if (selectedStudyTool === easyRead) {
      router.push(`/easy-read/${documentId}`);
    } else {
      router.push(`/questions/view-questions/${documentId}`);
    }
  };

  const { data: userProfile } = useGetUserProfileQuery("");

  const modeTabs: {
    title: string;
    label: string;
    icon: typeof ClipboardCheck;
  }[] = [
    { title: "Test Mode", label: "Test mode", icon: ClipboardCheck },
    { title: "Study Mode", label: "Study mode", icon: BookOpenText },
  ];

  const selectedTestFormatLabel = toSentenceCase(selectedQuestionType);

  return !permissions ? null : (
    <section className="mx-auto w-full max-w-[1040px] md:pt-9 max-md:flex max-md:flex-col max-md:min-h-[calc(100dvh-76px)]">
      {isAdditionalSettings && (
        <Modal>
          <AdditionalSettingsContainer
            canUseDifficulty={formik.values.questionType !== "6"}
            handleClose={() => {
              setIsAdditionalSettings(false);
            }}
            allTopics={documentTopics.map((t) => t.label)}
            topicsWithPages={topicsWithPages}
            selectedTopics={selectedTopics}
            handleSelectTopics={(topics) => {
              setSelectedTopics(topics);
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
            title="Select study tool"
          />
        </Modal>
      )}

      <div className="flex items-start justify-between gap-6 mb-[30px] max-md:mb-[18px]">
        <h1 className="max-md:hidden pt-1 text-[28px] leading-[1.2] font-bold tracking-[-0.025em] text-ink">
          Welcome back
          {userProfile
            ? `, ${capitalizeFirstLetterOfEachWord(userProfile.firstName)}`
            : null}
        </h1>
        <div className="flex flex-col items-end max-md:items-stretch max-md:w-full">
          <div
            role="group"
            aria-label="Mode"
            className="inline-flex gap-0.5 p-1 rounded-xl bg-sunken max-md:w-full"
          >
            {modeTabs.map(({ title, label, icon: Icon }) => {
              const isActive = activeTab === title;
              return (
                <button
                  key={title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    const mutatedTabs = tabs.map((t) => {
                      if (t.title === title) {
                        return { ...t, isActive: true };
                      }
                      return { ...t, isActive: false };
                    });
                    setTabs(mutatedTabs);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 h-9 max-md:h-[38px] max-md:flex-1 px-4 rounded-[9px] text-sm font-semibold whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-surface text-ink shadow-[0_1px_2px_rgba(16,12,40,0.1),0_0_0_0.5px_rgba(16,12,40,0.06)]"
                      : "text-subtle hover:text-ink"
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className={isActive ? "text-accent" : "text-faint"}
                    aria-hidden
                  />
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 max-md:mt-2 text-[13px] text-muted max-md:text-center">
            {activeTab === "Study Mode"
              ? "Read with ease and absorb key summaries"
              : "Simulate real test conditions"}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <Form className="mx-auto w-full max-w-[560px] flex flex-col max-md:flex-1">
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
            <>
              <div className="flex flex-col gap-[18px] max-md:gap-4 mt-7 max-md:mt-6 max-md:mb-6">
                <TextField
                  label="Document title"
                  placeholder="Enter a title for your document"
                  {...formik.getFieldProps("title")}
                  error={formik.touched.title ? formik.errors.title : undefined}
                />

                <PickerField
                  id="study-tool"
                  label="Study tool"
                  icon={BookOpen}
                  value={
                    studyModeFormats.filter(
                      (m) => m.value === selectedStudyTool
                    )[0]?.title || ""
                  }
                  placeholder="Select study tool"
                  isOpen={isStudyModeModal}
                  onClick={() => {
                    setIsStudyModeModal(true);
                  }}
                />
              </div>
              <div className={submitBarClass}>
                <Button
                  title="Start studying"
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
                  onClick={async () => {
                    await handleStartStudying();
                  }}
                />
              </div>
            </>
          )}

          {activeTab === "Test Mode" && (
            <>
              <div className="flex flex-col gap-[18px] max-md:gap-4 mt-7 max-md:mt-6 max-md:mb-6">
                <TextField
                  label="Document title"
                  placeholder="Enter a title for your document"
                  {...formik.getFieldProps("title")}
                  error={formik.touched.title ? formik.errors.title : undefined}
                />

                <div
                  className={cn("grid gap-3.5 max-md:grid-cols-1 max-md:gap-4", {
                    "grid-cols-2": formik.values.questionType !== "6",
                  })}
                >
                  <PickerField
                    id="test-format"
                    label="Test format"
                    icon={ListChecks}
                    value={selectedTestFormatLabel}
                    isOpen={isTestFormatModal}
                    onClick={() => {
                      setIsTestFormatModal(true);
                    }}
                  />

                  {formik.values.questionType !== "6" && (
                    <PickerField
                      id="total-questions"
                      label="Total questions"
                      icon={Hash}
                      value={formik.values.questionCount || "5"}
                      isOpen={isTotalQuestionsForm}
                      onClick={() => {
                        setIsTotalQuestionsForm(true);
                      }}
                    />
                  )}
                </div>

                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setIsAdditionalSettings(true);
                  }}
                  className="self-start inline-flex items-center gap-2 h-9 max-md:h-10 px-2.5 -mt-1 -ml-2.5 rounded-lg text-sm font-semibold text-accent hover:bg-hover transition-colors"
                >
                  <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden />
                  Additional settings
                  <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
                </button>
              </div>

              <div className={submitBarClass}>
                <Button
                  title="Generate test"
                  size="large"
                  fullWidth
                  disabled={
                    !formik.isValid ||
                    !fileId ||
                    !file ||
                    uploadFileLoading ||
                    !documentId ||
                    isLoading
                  }
                />
              </div>
            </>
          )}
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
    icon: <ScrollText size={19} strokeWidth={1.75} />,
  },
  {
    title: "Easy read",
    value: 2,
    description:
      "Simplifies each page of your material into easier-to-understand language",
    icon: <BookOpenText size={19} strokeWidth={1.75} />,
    isBeta: true,
  },
  // {
  //   title: "Related Videos",
  //   value: 7,
  //   description: "Helpful videos to reinforce your understanding",
  //   icon: <EssayIcon />,
  // },
];

export const testFormats: TestFormatItem[] = [
  {
    title: "Multiple Choice",
    value: 3,
    description: "Sharpen recall, solidify facts",
    icon: <ListChecks size={19} strokeWidth={1.75} />,
  },
  {
    title: "Flash Cards",
    value: 4,
    description: "Master concepts in bite-sized bursts",
    icon: <Layers size={19} strokeWidth={1.75} />,
  },
  {
    title: "Multiple True-False",
    value: 5,
    description: "Tackle complexity with precision",
    icon: <ListTodo size={19} strokeWidth={1.75} />,
  },
  {
    title: "Oral (viva)",
    value: 6,
    description: "Think fast, speak with clarity",
    icon: <Mic size={19} strokeWidth={1.75} />,
    isBeta: true,
  },
  {
    title: "Essay",
    value: 7,
    description: "Think deeply. Write clearly.",
    icon: <PenLine size={19} strokeWidth={1.75} />,
  },
];

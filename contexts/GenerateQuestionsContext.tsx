import QuestionGenerationLoadingModal from "@/@modules/questions/QuestionGenerationLoadingModal";
import QuestionGenerationSuccessModal from "@/@modules/questions/QuestionGenerationSuccessModal";
import { useGenerateQuestionsV2Mutation } from "@/api-services/questions.service";
import { GenerateQuestionsDto } from "@/dto/questions.dto";
import { clearMessages } from "@/features/documentChatSlice";
import { hyphenateString } from "@/utils";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

type GenerateQuestionsMutationTuple = ReturnType<
  typeof useGenerateQuestionsV2Mutation
>;

type GenerateQuestionsTrigger = GenerateQuestionsMutationTuple[0];

interface ContextOptions {
  generateQuestionsV2: GenerateQuestionsTrigger;
  isLoading: boolean;
  isSuccess: boolean;
  error: any;
  data: GenerateQuestionsDto | undefined;
  setUploadedDocumentId: React.Dispatch<React.SetStateAction<string | null>>;
}

const GenerateQuestionsContext = React.createContext<ContextOptions | null>(
  null
);

const GenerateQuestionsProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [generateQuestionsV2, { isLoading, isSuccess, error, data }] =
    useGenerateQuestionsV2Mutation();
  const [showTopLevelLoader, setShowTopLevelLoader] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showSucessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Questions Generated Successfully");
      setShowSuccessModal(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      setShowTopLevelLoader(false);
      setShowSuccessModal(false);
      setDocumentId(null)
    }
  }, [error]);

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else
        toast.error(
          "An error occured while generating questions"
        );
    }
  }, [error]);

  return (
    <GenerateQuestionsContext.Provider
      value={{
        generateQuestionsV2,
        isLoading,
        isSuccess,
        error,
        data,
        setUploadedDocumentId: setDocumentId,
      }}
    >
      {isLoading && (
        <QuestionGenerationLoadingModal
          handleStartTest={() => {
            if (!data) return;
            // remove prev doc messages
            dispatch(clearMessages());
            router.push(
              `/questions/practise-questions/${hyphenateString(
                (data as GenerateQuestionsDto).type.toLowerCase()
              )}/${(data as GenerateQuestionsDto).id}`
            );
            setDocumentId(null)
          }}
          handleViewSummary={() => {
            dispatch(clearMessages());
            router.push(`/questions/view-questions/${documentId}?tab=Summary`);
            setShowTopLevelLoader(true);
          }}
          isComplete={isSuccess}
          showTopLevelLoader={showTopLevelLoader}
        />
      )}
      {!isLoading && showSucessModal && (
        <QuestionGenerationSuccessModal
          handleClose={() => {
            setShowSuccessModal(false);
            setShowTopLevelLoader(false);
          }}
          handleStartTest={() => {
            if (!data) return;
            // remove prev doc messages
            dispatch(clearMessages());
            router.push(
              `/questions/practise-questions/${hyphenateString(
                (data as GenerateQuestionsDto).type.toLowerCase()
              )}/${(data as GenerateQuestionsDto).id}`
            );
            setShowSuccessModal(false);
            setShowTopLevelLoader(false);
            setDocumentId(null)
          }}
          percentageLoading={100}
        />
      )}
      {children}
    </GenerateQuestionsContext.Provider>
  );
};

export const useGenerateQuestionsContext: () => ContextOptions = () => {
  const context = React.useContext(GenerateQuestionsContext);
  if (!context)
    throw new Error(
      "Generate questions context can only be used within generate questions provider"
    );
  return context;
};

export default GenerateQuestionsProvider;

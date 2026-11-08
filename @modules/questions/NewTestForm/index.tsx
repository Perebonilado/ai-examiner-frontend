import { DialogFrame } from "@/@modules/home/DialogFrame";
import React, { FC, useEffect } from "react";
import CurrentStepIndicator from "./CurrentStepIndicator";
import NavigationContainer from "./NavigationContainer";
import TestFormat from "./Steps/TestFormat";
import TotalQuestions from "./Steps/TotalQuestions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import { resetNewTestForm, Steps } from "@/features/newTestSlice";
import AdditionalSettings from "./Steps/AdditionalSettings";
import TestSummaryView from "./TestSummaryView";
import Modal from "@/@shared/components/Modal";
import { useGenerateQuestionsV2Mutation } from "@/api-services/questions.service";
import { DifficultyType } from "@/models/questions.model";
import { toast } from "react-toastify";
import LoaderCard from "@/@shared/components/LoaderCard";
import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";

const NewTestForm: FC = () => {
  const {
    currentStep,
    isSummaryView,
    isNewTestFormOpen,
    documentId,
    additionalSettings,
    totalQuestions,
    selectedTestFormat,
    selectedTopics,
    selectedQuestionTopics,
  } = useSelector((state: RootState) => state.newTestSliceReducer);
  const { permissions } = useSelector(
    (state: RootState) => state.permissionsState
  );

  const [generateTest, { isLoading, error, data }] =
    useGenerateQuestionsV2Mutation();

  const handleTestGeneration = () => {
    generateTest({
      documentId: documentId!,
      payload: {
        difficulty: additionalSettings.difficulty as DifficultyType,
        includeUseCases: additionalSettings.isCaseStudies,
        questionCount: totalQuestions,
        questionType: selectedTestFormat,
        selectedTopicIds: selectedTopics.map((t) => t.id),
        // The API uses topic names only when no topic ids are sent.
        ...(selectedTopics.length === 0 && selectedQuestionTopics.length
          ? { selectedQuestionTopics }
          : {}),
      },
    });
  };

  useEffect(() => {
    if (data) {
      toast.success("Your test is ready!");
      window.location.href = `${window.location.origin}/questions/practise-questions/${data.type}/${data.id}`;
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error("Something went wrong while generating your test");
    }
  }, [error]);

  const dispatch = useDispatch();

  return (
    <>
      {isNewTestFormOpen && (
        <Modal>
          {permissions.maxGenerationReached && (
            <MaxGenerationModal
              handleClose={() => {
                dispatch(resetNewTestForm());
              }}
            />
          )}
          {!permissions.maxGenerationReached && (
            <>
              {isLoading && <LoaderCard message="Preparing your test" />}
              {!isLoading && (
                <DialogFrame
                  widthClass="max-w-[440px]"
                  labelledBy={
                    isSummaryView ? "new-test-summary-title" : undefined
                  }
                >
                  <NavigationContainer />
                  {isSummaryView ? (
                    <TestSummaryView generateTest={handleTestGeneration} />
                  ) : (
                    <>
                      <CurrentStepIndicator
                        currentStep={currentStep}
                        totalSteps={Steps.size}
                      />

                      {currentStep === Steps.get("TEST_FORMAT") && (
                        <TestFormat />
                      )}
                      {currentStep === Steps.get("TOTAL_QUESTIONS") && (
                        <TotalQuestions />
                      )}
                      {currentStep === Steps.get("ADDITIONAL_SETTINGS") && (
                        <AdditionalSettings />
                      )}
                    </>
                  )}
                </DialogFrame>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
};

export default NewTestForm;

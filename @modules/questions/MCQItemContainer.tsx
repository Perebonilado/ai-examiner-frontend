import Container from "@/@shared/ui/Container";
import { QuestionsModel } from "@/models/questions.model";
import React, { FC, useEffect, useState } from "react";
import MCQItem from "./MCQItem";
import Button from "@/@shared/ui/Button";
import { useModalContext } from "@/contexts/ModalContext";
import SubmissionModal from "./SubmissionModal";
import { toast } from "react-toastify";
import { useSaveScoreMutation } from "@/api-services/questions.service";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useParams } from "next/navigation";

interface Props {
  data: QuestionsModel[];
  handleDone: () => void;
  documentId: string;
  title: string
}

const MCQItemContainer: FC<Props> = ({ data, handleDone, documentId, title }) => {
  const [questionAnswerMap, setQuestionAnswerMap] = useState<Record<
    string,
    boolean
  > | null>(null);

  const [questionId, setQuestionId] = useState("");

  const params = useParams();

  useEffect(() => {
    if (params.id) setQuestionId(params.id as string);
  }, [params]);

  const { setModalContent } = useModalContext();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [resetAllSelectionsTrigger, setResetAllSelectionsTrigger] =
    useState(false);

  const [saveScore, { isLoading, isSuccess }] = useSaveScoreMutation();

  useEffect(() => {
    if (isLoading) {
      setModalContent(
        <AppLoader loaderMessage="Just a moment while we evaluate your score" />
      );
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess && !isLoading) {
      setModalContent(
        <SubmissionModal title={title} scorePercentage={calculateScorePercentage()} />
      );
    }
  }, [isSuccess, isLoading]);

  const handleSetQuestionAnswerMap = () => {
    const map: Record<string, boolean> = {};

    for (const item of data) {
      map[`${item.id}`] = false;
    }

    setQuestionAnswerMap(map);
  };

  useEffect(() => {
    handleSetQuestionAnswerMap();
  }, [data]);

  const handleSetQuestionAnswerMapItem = (id: string, value: boolean) => {
    const newMap = { ...questionAnswerMap };
    newMap[id] = value;
    setQuestionAnswerMap(newMap);
  };

  const calculateScorePercentage = () => {
    if (questionAnswerMap) {
      const answersArr = Object.values(questionAnswerMap);

      const totalQuestions = answersArr.length;

      const totalCorrectAnswers = answersArr.filter((ans) => ans).length;

      const scorePercentage = (totalCorrectAnswers / totalQuestions) * 100;

      return scorePercentage;
    }

    return 0;
  };

  const handleResetAnswers = () => {
    const questionAnswerMapCopy = { ...questionAnswerMap };
    for (const key in questionAnswerMapCopy) {
      questionAnswerMapCopy[key] = false;
    }
    setQuestionAnswerMap(questionAnswerMapCopy);
    setIsSubmitted(false);
    setResetAllSelectionsTrigger(!resetAllSelectionsTrigger);
  };

  return (
    <section>
      <Container className="py-10">
        <div className="flex flex-col gap-[80px]">
          {data.map((question, idx) => (
            <MCQItem
              {...question}
              key={question.id}
              questionNumber={idx + 1}
              handleSetQuestionAnswer={handleSetQuestionAnswerMapItem}
              submitted={isSubmitted}
              isResetSelection={resetAllSelectionsTrigger}
            />
          ))}
        </div>

        <div className="flex justify-end gap-4 w-full max-w-[800px] mx-auto py-8">
          {!isSubmitted ? (
            <>
              <Button
                title="Submit"
                size="large"
                onClick={() => {
                  setIsSubmitted(true);
                  saveScore({
                    documentId: documentId,
                    questionId,
                    score: calculateScorePercentage(),
                  });
                }}
              />
            </>
          ) : (
            <>
              {/* <Button
                title="Reset Answers"
                variant="outlined"
                onClick={() => {
                  handleResetAnswers();
                  toast.success("Answers Reset Successfully!");
                }}
              /> */}
              <Button title="Done" onClick={handleDone} size="large" />
            </>
          )}
        </div>
      </Container>
    </section>
  );
};

export default MCQItemContainer;

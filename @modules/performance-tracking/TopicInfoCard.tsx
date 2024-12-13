import React, { FC, useEffect, useState } from "react";
import Button from "@/@shared/ui/Button";
import { PerformanceTrackingParsingData } from "@/dto/performane-tracking.dto";
import TopicInfoCardItem from "./TopicInfoCardItem";

interface Props {
  status: "pass" | "fail";
  groupedQuestions: Record<
    string,
    Record<"correct" | "wrong", PerformanceTrackingParsingData[]>
  >;
  handleGenerateQuestions: (selectedTopics: string[]) => void;
}

const TopicInfoCard: FC<Props> = ({
  status,
  groupedQuestions,
  handleGenerateQuestions,
}) => {
  const calculateTotalQuestions = () => {
    let total = 0;

    if (groupedQuestions) {
      total = Object.values(groupedQuestions).reduce((acc, prev) => {
        return prev.correct.length + prev.wrong.length + acc;
      }, 0);
    }

    return total;
  };

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState(
    groupedQuestions ? Object.entries(groupedQuestions) : []
  );

  useEffect(() => {
    const defaultSelectedTopics: string[] = [];

    Object.entries(groupedQuestions).forEach(([topic, scoreInfo]) => {
      if (scoreInfo.wrong.length) {
        defaultSelectedTopics.push(topic);
      }
    });

    if (defaultSelectedTopics.length) {
      setSelectedTopics(defaultSelectedTopics);
    }
  }, []);

  return (
    <>
      <div className="w-full mx-auto max-w-[500px]">
        <h4 className="font-semibold">
          Total questions ({calculateTotalQuestions()})
        </h4>
        <p className="text-xs mb-5">
          Select topics you would like to generate questions
        </p>
      </div>
      <div
        className={`w-full max-w-[500px] border border-grey-200 rounded-xl flex flex-col max-h-[500px] mx-auto`}
      >
        <div className="flex items-center py-4 px-2 pl-6 text-xs text-[#939393] border-b  border-b-gray-200">
          <div style={{ flex: 3 }} className="pl-8">
            <p>Topics</p>
          </div>
          <div style={{ flex: 1 }}>
            <p>Score</p>
          </div>
        </div>
        <div className="flex flex-col overflow-auto">
          {performanceData[1].length ? (
            performanceData
              .sort((a, b) => {
                const wrongA = a[1].wrong.length;
                const wrongB = b[1].wrong.length;
                return wrongB - wrongA;
              })
              .map(([topic, performanceDetails], idx) => {
                return (
                  <TopicInfoCardItem
                    key={idx}
                    correctQuestionsCount={performanceDetails.correct.length}
                    topicTitle={topic}
                    totalQuestionsCount={
                      performanceDetails.correct.length +
                      performanceDetails.wrong.length
                    }
                    isSelected={selectedTopics.includes(topic)}
                    toggleTopicSelection={(topic) => {
                      if (!selectedTopics.includes(topic)) {
                        const newSelectedTopics = [...selectedTopics, topic];
                        setSelectedTopics(newSelectedTopics);
                      } else {
                        const newSelectedTopics = selectedTopics.filter(
                          (t) => t !== topic
                        );
                        setSelectedTopics(newSelectedTopics);
                      }
                    }}
                  />
                );
              })
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              No performance data
            </p>
          )}
        </div>
      </div>
      <div className="w-full mx-auto max-w-[500px] mt-20 flex justify-center">
        <Button
          title="Generate Test"
          size="large"
          fullWidth
          onClick={() => {
            handleGenerateQuestions(selectedTopics);
          }}
        />
      </div>
    </>
  );
};

export default TopicInfoCard;

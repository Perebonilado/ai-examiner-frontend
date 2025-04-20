import Button from "@/@shared/ui/Button";
import React, { FC, useState } from "react";
import TopicMenuItem from "./TopicMenuItem";

interface Props {
  topics: string[];
  handleSave: (selectedTopics: string[]) => void;
  selectedTopics: string[];
}

const TopicSelectionContainer: FC<Props> = ({
  handleSave,
  topics,
  selectedTopics,
}) => {
  const [selectedTopics_, setSelectedTopics_] = useState(selectedTopics);
  return (
    <div className="bg-white p-6 pt-0 rounded-2xl min-w-full">
      <h3 className="text-lg font-bold mb-6">Quick topic suggestions</h3>

      <div className="mt-4 flex flex-col gap-5 h-[280px]  overflow-y-auto">
        {topics.length ? (
          topics.map((topic, idx) => {
            return (
              <TopicMenuItem
                key={idx}
                handleSelect={(topic) => {
                  if (selectedTopics_.includes(topic)) {
                    const newTopics = selectedTopics_.filter((t) => {
                      return t !== topic;
                    });

                    setSelectedTopics_(newTopics);
                  } else {
                    setSelectedTopics_([topic, ...selectedTopics_]);
                  }
                }}
                selected={selectedTopics_.includes(topic)}
                title={topic}
              />
            );
          })
        ) : (
          <p className="text-center text-xs text-gray-400">Topics unavailable</p>
        )}
      </div>

      <div className="w-fit mx-auto mt-4">
        <Button
          title="Save"
          size="large"
          disabled={!topics.length}
          onClick={() => {
            handleSave(selectedTopics_);
          }}
        />
      </div>
    </div>
  );
};

export default TopicSelectionContainer;

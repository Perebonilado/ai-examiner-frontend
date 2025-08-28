import Button from "@/@shared/ui/Button";
import React, { FC, useState } from "react";
import TopicMenuItem from "./TopicMenuItem";
import { TopicsV2Model } from "@/models/file-upload.model";

interface Props {
  topics?: string[];
  topicsWithPages: TopicsV2Model[];
  handleSave: (selectedTopic: TopicsV2Model[]) => void;
  selectedTopics: TopicsV2Model[];
}

const TopicSelectionContainer: FC<Props> = ({
  handleSave,
  topics,
  selectedTopics,
  topicsWithPages,
}) => {
  const [selectedTopics_, setSelectedTopics_] = useState(selectedTopics);
  return (
    <div className="bg-white pt-0 rounded-2xl min-w-full">
      <h3 className="text-lg font-bold mb-6">Quick topic suggestions</h3>

      <div className="mt-4 flex flex-col gap-5 h-[280px]  overflow-y-auto">
        {topicsWithPages.length ? (
          topicsWithPages.map((topic, idx) => {
            return (
              <TopicMenuItem
                key={idx}
                handleSelect={(topic) => {
                  const exisingTopic = selectedTopics_.find((t) => {
                    return t.id === topic.id;
                  });

                  if (!!exisingTopic) {
                    const newSelectedTopics = selectedTopics_.filter((t) => {
                      return t.id !== exisingTopic.id;
                    });
                    setSelectedTopics_(newSelectedTopics);
                  } else {
                    setSelectedTopics_([topic, ...selectedTopics_]);
                  }
                }}
                selected={
                  !!selectedTopics_.find((t) => {
                    return t.id === topic.id;
                  })
                }
                topic={topic}
              />
            );
          })
        ) : (
          <p className="text-center text-xs text-gray-400">
            Topics unavailable
          </p>
        )}
      </div>

      <div className="w-fit mx-auto mt-4">
        <Button
          title="Save"
          size="large"
          disabled={!topicsWithPages?.length}
          onClick={() => {
            handleSave(selectedTopics_);
          }}
        />
      </div>
    </div>
  );
};

export default TopicSelectionContainer;

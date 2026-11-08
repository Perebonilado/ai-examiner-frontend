import Button from "@/@shared/ui/Button";
import React, { FC, useState } from "react";
import TopicMenuItem from "./TopicMenuItem";
import { TopicsV2Model } from "@/models/file-upload.model";
import { DialogFooter, DialogHeader } from "./DialogFrame";

interface Props {
  topics?: string[];
  topicsWithPages: TopicsV2Model[];
  handleSave: (selectedTopic: TopicsV2Model[]) => void;
  selectedTopics: TopicsV2Model[];
  /** Close button in the title row (standalone dialog). */
  onClose?: () => void;
  /** Back button in the title row (standalone dialog). */
  onBack?: () => void;
}

/* "Quick topic suggestions": one calm multi-select list; Save applies the selection. */
const TopicSelectionContainer: FC<Props> = ({
  handleSave,
  selectedTopics,
  topicsWithPages,
  onClose,
  onBack,
}) => {
  const [selectedTopics_, setSelectedTopics_] = useState(selectedTopics);
  return (
    <div className="min-w-full flex flex-col">
      <DialogHeader
        title="Quick topic suggestions"
        titleId="topics-title"
        description="Choose one or more topics for your test."
        descriptionId="topics-help"
        onClose={onClose}
        onBack={onBack}
      />

      <div className="px-2 pt-3 pb-3 max-md:pt-2">
        {topicsWithPages.length ? (
          <div
            role="group"
            aria-labelledby="topics-title"
            aria-describedby="topics-help"
            className="flex flex-col gap-1.5 max-h-[min(480px,62vh)] overflow-y-auto pr-0.5 max-md:max-h-none"
          >
            {topicsWithPages.map((topic, idx) => {
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
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            Topics unavailable
          </p>
        )}
      </div>

      <DialogFooter className="mt-auto">
        <Button
          title="Save"
          size="medium"
          disabled={!topicsWithPages?.length}
          onClick={() => {
            handleSave(selectedTopics_);
          }}
        />
      </DialogFooter>
    </div>
  );
};

export default TopicSelectionContainer;

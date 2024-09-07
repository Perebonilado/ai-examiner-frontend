import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import IconButton from "@/@shared/ui/IconButton";
import { RootState } from "@/config/redux-config";
import { useModalContext } from "@/contexts/ModalContext";
import ArrowUpIcon from "@/icons/ArrowUpIcon";
import ChatIcon from "@/icons/ChatIcon";
import React, { FC, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

interface Props {
  handleSendMessage: (message: string) => void;
  chatDisabled: boolean;
  documentTitle: string;
}

const NewMessageContainer: FC<Props> = ({
  handleSendMessage,
  chatDisabled,
  documentTitle,
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  useEffect(() => {
    if (textareaRef.current) {
      // Reset the height to 'auto' to shrink it back to the scroll height
      textareaRef.current.style.height = "auto";
      // Set the height based on the scroll height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (value.trim().length) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [value]); // This effect runs every time the value changes

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const { setModalContent } = useModalContext();

  const onSubmit = () => {
    if (!permissions.canDiscuss) {
      setModalContent(
        <MaxGenerationModal
          title="Discussions only available on a paid plan!"
          body="Please, subscribe to a paid plan to continue"
        />
      );
    } else {
      handleSendMessage(value);
      setValue("");
    }
  };

  return (
    <div className="min-h-[25px] px-3 py-1 flex gap-4 items-center border border-gray-300 rounded-xl">
      <ChatIcon />
      <div className="w-full flex items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={`Ask AI Examiner anything about ${documentTitle}`}
          className="placeholder:italic h-full placeholder:text-xs max-sm:placeholder:text-xs w-full outline-none max-h-[150px] overflow-y-auto resize-none rounded"
          rows={1}
        ></textarea>
      </div>
      <IconButton
        icon={<ArrowUpIcon />}
        onClick={onSubmit}
        className={
          isDisabled || chatDisabled
            ? "!bg-gray-300 !border-gray-300 transition-all cursor-auto"
            : "transition-all"
        }
      />
    </div>
  );
};

export default NewMessageContainer;

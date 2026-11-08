import MaxGenerationModal from "@/@shared/components/MaxGenerationModal";
import { RootState } from "@/config/redux-config";
import { useModalContext } from "@/contexts/ModalContext";
import { ArrowUp } from "lucide-react";
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

  const isOff = isDisabled || chatDisabled;

  return (
    <div className="flex items-end gap-2 p-1.5 pl-4 rounded-[24px] border border-control bg-surface shadow-[0_1px_2px_rgba(16,12,40,0.05),0_8px_20px_-10px_rgba(16,12,40,0.18)] focus-within:border-[#c4c3cb] transition-colors">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        aria-label="Message"
        placeholder={`Ask AI Examiner anything about ${documentTitle}`}
        className="flex-1 min-w-0 min-h-9 max-h-[150px] py-2 resize-none bg-transparent border-0 outline-none focus-visible:outline-none text-sm leading-[1.4] text-ink placeholder:text-faint overflow-y-auto"
        rows={1}
      ></textarea>
      <button
        type="button"
        aria-label="Send"
        onClick={onSubmit}
        className={
          isOff
            ? "grid place-items-center w-9 h-9 shrink-0 rounded-full text-white bg-control cursor-auto transition-colors"
            : "grid place-items-center w-9 h-9 shrink-0 rounded-full text-white bg-brand hover:bg-brand-hover transition-colors"
        }
      >
        <ArrowUp size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
};

export default NewMessageContainer;

import IconButton from "@/@shared/ui/IconButton";
import ArrowUpIcon from "@/icons/ArrowUpIcon";
import ChatIcon from "@/icons/ChatIcon";
import React, { FC, useEffect, useRef, useState } from "react";

const NewMessageContainer: FC = () => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

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

  const onSubmit = () =>{
    setValue("")
  }

  return (
    <div className="min-h-[25px] px-3 py-1 flex gap-4 items-center border border-gray-300 rounded-xl">
      <ChatIcon />
      <div className="w-full flex items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder="Chat with AI Examiner"
          className="placeholder:italic w-full outline-none max-h-[150px] overflow-y-auto resize-none rounded"
          rows={1}
        ></textarea>
      </div>
      <IconButton
        icon={<ArrowUpIcon />}
        onClick={onSubmit}
        className={
          isDisabled
            ? "!bg-gray-300 !border-gray-300 transition-all cursor-auto"
            : "transition-all"
        }
      />
    </div>
  );
};

export default NewMessageContainer;

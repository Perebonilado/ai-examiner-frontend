import React, { FC, useEffect, useState, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import cn from "classnames";

interface Props {
  message: string;
}

const SystemMessage: FC<Props> = ({ message }) => {
  const [htmlMessage, setHtmlMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      handleHtmlMessage();
    }
  }, [message]);

  useEffect(() => {
    if (innerRef.current) {
      const height = innerRef.current.scrollHeight;
      setShouldShowToggle(height > 200);
      setContentHeight(isExpanded ? height : 400);
    }
  }, [htmlMessage, isExpanded]);

  const handleHtmlMessage = async () => {
    const formatted = message;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlMessage(parsed);
  };

  return (
    <div className="relative w-full max-w-[600px] bg-white p-3 rounded-xl">
      <div
        className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
        style={{ maxHeight: contentHeight ?? 200 }}
      >
        <div
          ref={innerRef}
          className="prose prose-sm !text-wrap overflow-x-hidden"
          dangerouslySetInnerHTML={{ __html: htmlMessage }}
        />
      </div>

      {!isExpanded && shouldShowToggle && (
        <div className="absolute bottom-8 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}

      {shouldShowToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-purple-600 mt-2 underline"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default SystemMessage;

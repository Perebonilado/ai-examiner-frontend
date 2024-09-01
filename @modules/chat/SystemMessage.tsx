import React, { FC, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface Props {
  message: string;
}

const SystemMessage: FC<Props> = ({ message }) => {
  const [htmlMessage, setHtmlMessage] = useState("");

  useEffect(() => {
    if (message) {
      handleHtmlMessage();
    }
  }, [message]);

  const handleHtmlMessage = async () => {
    const formatted = message;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlMessage(parsed);
  };
  return (
    <div
      className="w-full prose-base max-w-full !text-wrap overflow-x-hidden"
      dangerouslySetInnerHTML={{ __html: htmlMessage }}
    ></div>
  );
};

export default SystemMessage;

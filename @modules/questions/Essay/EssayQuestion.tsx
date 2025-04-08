import React, { FC, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface Props {
  question: string;
}

const EssayQuestion: FC<Props> = ({ question }) => {
  const [htmlQuestion, setHtmlQuestion] = useState("");

  const handleHtmlQuestion = async () => {
    const formatted = question;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    setHtmlQuestion(parsed);
  };

  useEffect(() => {
    if (question) {
      handleHtmlQuestion();
    }
  }, [question]);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlQuestion }}
      className="prose prose-sm max-w-full text-gray-800 overflow-x-hidden"
    ></div>
  );
};

export default EssayQuestion;

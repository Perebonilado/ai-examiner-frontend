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
      className="overflow-x-hidden [&_p+p]:mt-2 [&_strong]:font-extrabold [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-[22px] [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-[22px] [&_li]:text-[15px] [&_li]:font-medium [&_li]:leading-[1.6] [&_li]:text-body [&_li]:tracking-normal [&_code]:text-[0.9em]"
    ></div>
  );
};

export default EssayQuestion;

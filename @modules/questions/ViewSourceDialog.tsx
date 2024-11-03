import React, { FC, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CloseIcon from "@/icons/CloseIcon";
import { useModalContext } from "@/contexts/ModalContext";
import { useQuestionSourceRequestMutation } from "@/api-services/questions.service";
import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";

interface Props {
  sourceText: string | null;
  handleSourceText: (text: string) => void;
  documentId: string;
  question: string;
}

const ViewSourceDialog: FC<Props> = ({
  sourceText,
  handleSourceText,
  question,
  documentId,
}) => {
  const [cleanedSourceText, setCleanedSourceText] = useState("");

  const [getQuestionSource, { data, isLoading, error }] =
    useQuestionSourceRequestMutation();

  useEffect(() => {
    if (sourceText) {
      handleHtmlMessage(sourceText).then((res) => {
        setCleanedSourceText(res);
      });
    } else {
      getQuestionSource({ question, documentId });
    }
  }, [sourceText]);

  useEffect(() => {
    if (data && data.data && !sourceText) {
      handleSourceText(data.data);
      handleHtmlMessage(data.data).then((res) => {
        setCleanedSourceText(res);
      });
    }
  }, [data]);

  const handleHtmlMessage = async (text: string) => {
    const formatted = text;
    const parsed = await marked(DOMPurify.sanitize(formatted), {});
    return parsed;
  };

  const { setModalContent } = useModalContext();

  return (
    <div className="w-full max-h-[90vh] relative max-w-[600px] max-md:max-w-[320px] max-sm:max-w-[95vw] rounded-xl shadow-lg p-4 py-10 pt-4 flex flex-col gap-10  bg-[#FAFAFA]">
      <div className="flex items-center justify-between h-[15%]">
        <h3 className="font-semibold text-[#9D6EC2]">Source Reference</h3>
        <button
          className="cursor-pointer"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="h-[85%] overflow-auto prose-base overflow-x-hidden">
        {cleanedSourceText && !isLoading && !error && (
          <div dangerouslySetInnerHTML={{ __html: cleanedSourceText }}></div>
        )}
        {isLoading && (
          <div className="mx-auto my-4 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-center font-semibold">
              Loading relevant references
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mx-auto my-4 flex flex-col items-center text-center justify-center">
            <Button title="Reload References" />
            <ErrorMessage message="Oops! let's give that another try" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSourceDialog;

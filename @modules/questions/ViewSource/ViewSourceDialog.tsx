import React, { FC, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useModalContext } from "@/contexts/ModalContext";
import { useQuestionSourceRequestMutation, useQuestionSourceRequestV2Mutation } from "@/api-services/questions.service";
import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { X } from "lucide-react";
import s from './styles.module.css'

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

  // const [getQuestionSource, { data, isLoading, error }] =
  //   useQuestionSourceRequestMutation();

  const [getQuestionSource, { data, isLoading, error }] =
    useQuestionSourceRequestV2Mutation();

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
    <div
      role="dialog"
      aria-labelledby="source-reference-title"
      className="w-full max-h-[90vh] relative max-w-[600px] max-md:max-w-[92vw] rounded-2xl shadow-pop border border-edge bg-surface flex flex-col overflow-hidden"
    >
      <div className="flex items-start gap-3 px-5 pt-5 pb-3 shrink-0">
        <h3
          id="source-reference-title"
          className="flex-1 text-lg font-bold text-ink tracking-[-0.015em]"
        >
          Source reference
        </h3>
        <button
          type="button"
          aria-label="Close"
          className="-mt-1.5 -mr-1.5 w-9 h-9 grid place-items-center rounded-lg text-subtle hover:bg-hover hover:text-ink transition-colors"
          onClick={() => {
            setModalContent(null);
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto overflow-x-hidden px-5 pb-6 text-sm leading-[1.7] text-body prose prose-sm max-w-none prose-headings:text-ink">
        {cleanedSourceText && !isLoading && !error && (
          <div className={s.highlight} dangerouslySetInnerHTML={{ __html: cleanedSourceText }}></div>
        )}
        {isLoading && (
          <div className="mx-auto my-6 flex flex-col items-center justify-center gap-3 not-prose">
            <Spinner />
            <p className="text-center text-sm font-semibold text-subtle">
              Loading relevant references
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mx-auto my-6 flex flex-col items-center gap-3 text-center justify-center not-prose">
            <ErrorMessage message="Oops! let's give that another try" />
            <Button
              title="Reload references"
              variant="outlined"
              onClick={() => {
                getQuestionSource({ question, documentId });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSourceDialog;

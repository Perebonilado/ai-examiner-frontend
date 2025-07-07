import React, { FC, useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { HighlightableText } from "@/@shared/components/HighlightableText";

interface Props {
  summary: string;
}

const SummaryContainer: FC<Props> = ({ summary }) => {
  const [htmlSummary, setHtmlSummary] = useState("");

  useEffect(() => {
    if (summary) {
      generateHtmlSummary();
    }
  }, [summary]);

  const generateHtmlSummary = async () => {
    // Sanitize first, then parse Markdown
    const sanitized = DOMPurify.sanitize(summary);
    const parsed = await marked(sanitized);
    setHtmlSummary(parsed);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col">
        {htmlSummary ? (
          <HighlightableText>
            <div className="flex-1 w-full h-full overflow-auto">
              <div
                className="prose prose-sm max-w-none break-words px-4 py-2"
                dangerouslySetInnerHTML={{ __html: htmlSummary }}
              />
            </div>
          </HighlightableText>
        ) : (
          <div className="flex-1 w-full h-full flex items-center justify-center text-gray-500">
            Summary Unavailable
          </div>
        )}
      </div>
    </>
  );
};

export default SummaryContainer;

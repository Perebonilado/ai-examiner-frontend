import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import TextField from "@/@shared/ui/Input/TextField";
import { useModalContext } from "@/contexts/ModalContext";
import CloseIcon from "@/icons/CloseIcon";
import { FC, useEffect, useState } from "react";

interface Props {
  fileUrl: string;
}

const PDFViewer: FC<Props> = ({ fileUrl }) => {
  const { setModalContent } = useModalContext();
  const [pages, setPages] = useState("all");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [startPageError, setStartPageError] = useState("");
  const [endPageError, setEndPageError] = useState("");

  useEffect(() => {
    if (pages === "all") {
      setIsSubmitDisabled(false);
      setStartPage("");
      setEndPage("");
      setStartPageError("");
      setEndPageError("");
    } else {
      if (startPage && endPage) {
        setIsSubmitDisabled(false);
      } else {
        setIsSubmitDisabled(true);
      }
    }
  }, [pages, startPage, endPage]);

  return (
    <div className="w-[90vw] max-w-[700px] h-[95vh] bg-[#F1EDFD] rounded-xl p-4 overflow-y-auto">
      <div className="flex justify-end pb-3">
        <button
          onClick={() => {
            setModalContent(null);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      <iframe src={fileUrl} height="65%" width="100%"></iframe>

      <div className="mt-3 flex flex-col gap-4">
        <DropDown
          options={[
            { label: "All", value: "all", defaultSelected: true },
            { label: "Custom", value: "custom", defaultSelected: true },
          ]}
          label="Pages"
          value={pages}
          handleSelect={({ value }) => {
            setPages(value);
          }}
        />

        {pages === "custom" && (
          <div className="flex gap-3">
            <TextField
              label="Start Page"
              value={startPage}
              error={startPageError}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (/^\d+$/.test(value) || value === "") {
                  setStartPage(value);

                  if (endPage && Number(value) > Number(endPage)) {
                    setStartPageError(
                      "Start page must be lesser than end page"
                    );
                  } else {
                    setStartPageError("");
                    setEndPageError("");
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value.startsWith("0")) {
                  setStartPage("");
                }
              }}
            />
            <TextField
              label="End Page"
              value={endPage}
              error={endPageError}
              onChange={(e) => {
                const value = e.target.value.trim();
                if (/^\d+$/.test(value) || value === "") {
                  setEndPage(value);

                  if (startPage && Number(startPage) > Number(value)) {
                    setEndPageError("End page must be greater than start page");
                  } else {
                    setEndPageError("");
                    setStartPageError("");
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value.startsWith("0")) {
                  setEndPage("");
                }
              }}
            />
          </div>
        )}

        <Button
          disabled={
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
          }
          title="Upload"
          size="large"
          className={`w-fit mx-auto ${
            isSubmitDisabled || Boolean(startPageError) || Boolean(endPageError)
              ? "bg-gray-300"
              : ""
          }`}
        />
      </div>
    </div>
  );
};

export default PDFViewer;

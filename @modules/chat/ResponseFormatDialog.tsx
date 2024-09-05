import Dialog from "@/@shared/components/Dialog";
import Checkbox from "@/@shared/ui/Input/Checkbox/Checkbox";
import React, { FC, useEffect, useState } from "react";

interface Props {
  handleSelectedOption: (value: string) => void;
  defaultSelectedOption: string;
}

const ResponseFormatDialog: FC<Props> = ({
  handleSelectedOption,
  defaultSelectedOption,
}) => {
  const [selectedResponseFormat, setSelectedFormat] = useState("");
  const responseFormatOptions = [
    {
      label: "In-depth",
      value: "indepth",
    },
    {
      label: "Summary",
      value: "summary",
    },
  ] as const;

  useEffect(() => {
    setSelectedFormat(defaultSelectedOption);
  }, []);

  return (
    <Dialog>
      <h3 className="font-bold text-lg mb-4">Customize your examiner</h3>
      <p className="text-sm">
        Choose the type of response you'd like for your questions
      </p>

      <div className="mt-7 flex flex-col gap-6">
        {responseFormatOptions.map((opt, idx) => {
          return (
            <Checkbox
              key={idx}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedFormat(value);
                handleSelectedOption(value);
              }}
              label={opt.label}
              value={opt.value}
              checked={opt.value === selectedResponseFormat}
            />
          );
        })}
      </div>
    </Dialog>
  );
};

export default ResponseFormatDialog;

import React, { FC, useState } from "react";
import PageControls from "./PageControls";
import EditIcon from "@/icons/EditIcon";

interface Props {
  totalCount: number;
  currentPage: number;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
}

const EditTextContainer: FC<Props> = ({ ...pageControls }) => {
  const [text, setText] = useState(
    "Migrainne (Pound)\n- Pulsatile or throbbing in nature\n- One-day duration (4-72 hrs), recurrent\n- Unilateral and severe pain\n- Nausea and Vomiting\n- Bowing\n- phonophobia & photophobia\n- Aura in 15-33%\n- Children may have bilateral headache & GI complaints\n\n1\nDiagnostic criteria pos migraine w/o aura\n- to diagnose there must have been 5 attacks with\n\n(1)\n- Recurring headache lasting 4-72 hours One day\n\n(2)\n- two of the following\n  (a) Unilateral\n  (b) Pulsating\n  (c) Disabling (- daily activities)\n  (d) Aggravated by physical activities)\n\n(3)\n- During the headache, at least one of the following\n  (1) Nausea & vomiting\n  (2) Photophobia & phonophobia\n\nDiagnostic criteria for migraine with aura"
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col border border-[#9E69E3] mb-3 rounded-2xl p-3 gap-3">
        <p className="text-right text-[#9333EA] text-sm font-medium flex items-center justify-end gap-2">
          <EditIcon width={15} height={15} fill="#9333EA"/>Edit text
        </p>
        <div className="flex-1">
          <textarea
            value={text}
            className="w-full h-full resize-none no-scrollbar outline-none border-none"
          ></textarea>
        </div>
      </div>
      <PageControls {...pageControls} />
    </div>
  );
};

export default EditTextContainer;

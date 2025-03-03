import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import VivaAnalysisItemAccordion from "./VivaAnalysisItemAccordion";
import { VivaAnalysisModel } from "@/models/viva.model";

interface Props {
  data: VivaAnalysisModel[];
}

const VivaAnalysisContainer: FC<Props> = ({ data }) => {
  return (
    <div>
      <div className="mx-auto w-fit mb-10">
        <Button title="Replay Conversation" variant="contained" size="large" />
      </div>
      {data.map((item, idx) => {
        return (
          <VivaAnalysisItemAccordion
            {...item}
            key={idx}
          />
        );
      })}
    </div>
  );
};

export default VivaAnalysisContainer;

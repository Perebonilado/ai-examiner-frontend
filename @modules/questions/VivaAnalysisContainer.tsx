import Button from "@/@shared/ui/Button";
import React, { FC } from "react";
import VivaAnalysisItem from "./VivaSystemResponse";
import VivaAnalysisItemAccordion from "./VivaAnalysisItemAccordion";

const VivaAnalysisContainer: FC = () => {
  return (
    <div>
      <div className="mx-auto w-fit mb-10">
        <Button title="Replay Conversation" variant="contained" size="large" />
      </div>
      <VivaAnalysisItemAccordion />
    </div>
  );
};

export default VivaAnalysisContainer;

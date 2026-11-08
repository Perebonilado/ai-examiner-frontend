import { AllDocumentsModel } from "@/models/document.model";
import React, { FC } from "react";
import DocumentCard from "./DocumentCard";

interface Props {
  data?: AllDocumentsModel[];
}

const DocumentCardContainer: FC<Props> = ({ data }) => {
  if (!data || !data.length) return null;
  return (
    <section className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-[18px] max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-4">
      {data.map((doc) => {
        return <DocumentCard {...doc} key={doc.id} />;
      })}
    </section>
  );
};

export default DocumentCardContainer;

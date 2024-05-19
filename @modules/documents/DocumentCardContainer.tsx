import { AllDocumentsModel } from "@/models/document.model";
import React, { FC } from "react";
import DocumentCard from "./DocumentCard";

interface Props {
  data?: AllDocumentsModel[];
}

const DocumentCardContainer: FC<Props> = ({ data }) => {
  return (
    <section className="flex items-center flex-wrap max-lg:justify-evenly gap-y-12 gap-10 mb-6">
      {data && data.length ? (
        data?.map((doc, idx) => {
          return <DocumentCard {...doc} key={idx} />;
        })
      ) : (
        <div className="mx-auto py-10">
            <p className="text-lg text-center">No Documents Found</p>
        </div>
      )}
    </section>
  );
};

export default DocumentCardContainer;

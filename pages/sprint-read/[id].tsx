import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetSprintReadDocumentFileQuery } from "@/api-services/document.service";
import AppLayoutV2 from "@/layouts/AppLayoutV2";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
const PDFReader = dynamic(
  () => import("@/@modules/questions/SprintRead/SprintReadPDFReader"),
  {
    ssr: false,
  }
);

const SprintRead: NextPage = () => {
  const params = useParams();
  const [documentId, setdocumentId] = useState<string>("");
  useEffect(() => {
    if (params) {
      setdocumentId(params.id as string);
    }
  }, [params]);
  const router = useRouter();
  const { data, isFetching, refetch } = useGetSprintReadDocumentFileQuery(
    { documentId },
    { skip: !documentId }
  );
  return (
    <>
      <AppHead title="Easy Read" />
      <AppLayoutV2
        handleBack={() => {
          router.push(`/questions/view-questions/${documentId}`);
        }}
        noPadding={true}
      >
        {!isFetching && data && (
          <PDFReader fileContent={data.content}  totalPages={data.totalPages}/>
        )}

        {isFetching && !data && (
          <div className="flex items-center justify-center py-20">
            <LoadingReader />
          </div>
        )}

        {!isFetching && !data && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ErrorMessage message="Something went wrong while loading your file" />
            <Button
              title="Retry"
              onClick={() => {
                refetch();
              }}
            />
          </div>
        )}
      </AppLayoutV2>
    </>
  );
};

export default SprintRead;

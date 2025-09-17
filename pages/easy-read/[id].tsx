import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import AppHead from "@/@shared/components/AppHead";
import {
  useGetModifiedContentQuery,
  useGetOriginalDocumentFileQuery,
} from "@/api-services/document.service";
import dynamic from "next/dynamic";
import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import Button from "@/@shared/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { setDocumentIdInView } from "@/features/documentChatSlice";
import Modal from "@/@shared/components/Modal";
import EasyReadHighlightModal from "@/@modules/questions/EasyRead/EasyReadHighlightModal";
import { hasSeenEasyReadHowToUseModal } from "@/constants";
import { RootState } from "@/config/redux-config";
const PDFReader = dynamic(
  () => import("@/@modules/questions/EasyRead/PDFReader"),
  {
    ssr: false,
  }
);

const EasyRead: NextPage = () => {
  const router = useRouter();
  const params = useParams();
  const [documentId, setdocumentId] = useState<string>("");
  useEffect(() => {
    if (params) {
      setdocumentId(params.id as string);
    }
  }, [params]);
  const permissions = useSelector(
    (state: RootState) => state.permissionsState.permissions
  );

  useEffect(()=>{
    if (!!permissions && permissions.maxGenerationReached && documentId) {
      router.push(`/questions/view-questions/${documentId}?maxEasyRead=true`)
    }
  },[permissions.maxGenerationReached, documentId])

  const {
    data: originalFileUrl,
    isFetching: urlFetching,
    isError: urlFetchError,
    refetch: refetchUrl,
  } = useGetOriginalDocumentFileQuery({ documentId }, { skip: !documentId });
  const {
    data: modifiedContent,
    isFetching: modifiedContentFetching,
    isError: modifiedContentError,
    refetch: refetchModifiedContent,
  } = useGetModifiedContentQuery({ documentId }, { skip: !documentId });

  const dispatch = useDispatch();

  useEffect(() => {
    if (documentId) {
      dispatch(setDocumentIdInView(documentId));
    }
  }, [documentId]);

  const [isEasyReadHighlightModal, setIsEasyReadHighlightModal] =
    useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(hasSeenEasyReadHowToUseModal);
    if (!hasSeenModal) {
      setIsEasyReadHighlightModal(true);
    }
  }, []);

  useEffect(()=>{

  },[])

  return (
    <>
      {isEasyReadHighlightModal && (
        <Modal>
          <EasyReadHighlightModal
            handleClose={() => {
              localStorage.setItem(hasSeenEasyReadHowToUseModal, "true");
              setIsEasyReadHighlightModal(false);
            }}
          />
        </Modal>
      )}
      <AppHead title="Easy Read" />
      <AppLayout
        handleBack={() => {
          router.push(`/questions/view-questions/${documentId}`);
        }}
        noPadding={true}
      >
        {!urlFetching &&
          !modifiedContentFetching &&
          originalFileUrl?.modifiedFile &&
          modifiedContent?.content && (
            <PDFReader
              originalFileUrl={originalFileUrl.modifiedFile}
              modifiedContent={modifiedContent}
            />
          )}

        {urlFetching || modifiedContentFetching ? (
          <div className="flex items-center justify-center py-20">
            <LoadingReader />
          </div>
        ) : null}

        {!urlFetching &&
        !modifiedContentFetching &&
        (urlFetchError || modifiedContentError) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ErrorMessage message="Something went wrong while loading your file" />
            <Button
              title="Retry"
              onClick={() => {
                if (urlFetchError) {
                  refetchUrl();
                }

                if (modifiedContentError) {
                  refetchModifiedContent();
                }
              }}
            />
          </div>
        ) : null}
      </AppLayout>
    </>
  );
};

export default EasyRead;

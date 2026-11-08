import { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppLayoutV2 from "@/layouts/AppLayoutV2";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import AppHead from "@/@shared/components/AppHead";
import {
  useGetAllUserDocumentsQuery,
  useGetOriginalDocumentFileQuery,
} from "@/api-services/document.service";
import { useGetAllSavedDocumentTopicsV2Query } from "@/api-services/document-topic.service";
import dynamic from "next/dynamic";
import LoadingReader from "@/@modules/questions/EasyRead/LoadingReader";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import Button from "@/@shared/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import Modal from "@/@shared/components/Modal";
import EasyReadHighlightModal from "@/@modules/questions/EasyRead/EasyReadHighlightModal";
import ReaderChrome from "@/@modules/questions/EasyRead/ReaderChrome";
import ReaderDock from "@/@modules/questions/EasyRead/ReaderDock";
import TopicsSheet from "@/@modules/questions/EasyRead/TopicsSheet";
import ReadingSettingsSheet from "@/@modules/questions/EasyRead/ReadingSettingsSheet";
import useReadingSettings from "@/@modules/questions/EasyRead/useReadingSettings";
import useEasyReadTimer from "@/@modules/questions/EasyRead/useEasyReadTimer";
import useSimplifiedPages from "@/@modules/questions/EasyRead/useSimplifiedPages";
import {
  EasyReadAllowanceBanner,
  EasyReadLimitDialog,
  EasyReadTimePill,
} from "@/@modules/questions/EasyRead/EasyReadAllowance";
import { useGetEasyReadAllowanceQuery } from "@/api-services/easy-read.service";
import { isEasyReadLimitError } from "@/models/easy-read.model";
import cn from "classnames";
import useMediaQuery from "@/@modules/questions/EasyRead/useMediaQuery";
import { ReaderMode } from "@/@modules/questions/EasyRead/types";
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
  // Free plan: 10 minutes of Easy Read a month (the server counts and enforces it).
  // If the allowance can't be read, let the reader load: the server still blocks when time is up.
  const { data: allowance, isError: allowanceError } =
    useGetEasyReadAllowanceQuery(undefined, { refetchOnMountOrArgChange: true });
  const noTimeAtOpen =
    !!allowance?.limited && (allowance.remainingSeconds ?? 0) <= 0;
  // The original loads at once (alongside the allowance check): the server answers 403 when a
  // free user has no time left, so nothing is downloaded or simplified for them.
  const skipContent = !documentId || noTimeAtOpen;

  const {
    data: originalFileUrl,
    isFetching: urlFetching,
    isError: urlFetchError,
    error: urlError,
    refetch: refetchUrl,
  } = useGetOriginalDocumentFileQuery({ documentId }, { skip: skipContent });
  // Simplified pages arrive one by one while the original is already on screen.
  // The page being read is simplified first.
  const readingPageRef = useRef(1);
  const handlePageChange = useCallback((page: number) => {
    readingPageRef.current = page;
  }, []);

  // Document title for the back link and the simplified pages' running folio.
  const titleInView = useSelector(
    (state: RootState) => state.documentChatReducer.documentTitleInView
  );
  const { data: documentData } = useGetAllUserDocumentsQuery(
    { courseId: "", page: 1, pageSize: 10, title: "", id: documentId },
    { skip: !documentId }
  );
  const documentTitle = documentData?.documents?.[0]?.title || titleInView || "";

  // Topics count for the phone bottom bar (same cached query as the topics panel).
  const { data: topics } = useGetAllSavedDocumentTopicsV2Query(
    { documentId },
    { skip: !documentId }
  );
  const topicsSummary = useMemo(() => {
    if (!topics?.length) return null;
    // The panel is hidden for topics without page ranges; so is its button.
    if (!topics.every((topic) => topic.startPage && topic.endPage)) return null;
    return {
      read: topics.filter((topic) => topic.isRead).length,
      total: topics.length,
    };
  }, [topics]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (documentId) {
      dispatch(setDocumentIdInView(documentId));
    }
  }, [documentId]);

  useEffect(() => {
    const title = documentData?.documents?.[0]?.title;
    if (title) {
      dispatch(setDocumentTitleInView(title));
    }
  }, [documentData]);

  const [isEasyReadHighlightModal, setIsEasyReadHighlightModal] =
    useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(hasSeenEasyReadHowToUseModal);
    if (!hasSeenModal) {
      setIsEasyReadHighlightModal(true);
    }
  }, []);

  // Lets the shell place the floating chat button beside the topics panel.
  useEffect(() => {
    document.body.setAttribute("data-reader", "");
    return () => document.body.removeAttribute("data-reader");
  }, []);

  // View: Original | Simplified | Side by side (side by side needs 1280px).
  const [mode, setMode] = useState<ReaderMode>("original");
  const isWide = useMediaQuery("(min-width: 1280px)");
  const viewMode: ReaderMode = mode === "split" && !isWide ? "original" : mode;
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  // Scroll / One page and text size, as in EasiRead's reading comfort settings.
  const readingSettings = useReadingSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // The original's actual scale, reported by the reader for the zoom read-out.
  const [originalScale, setOriginalScale] = useState(1);

  const backHref = `/questions/view-questions/${documentId}`;
  const isLoading = urlFetching;
  const contentReady = !isLoading && !!originalFileUrl?.modifiedFile;

  // Counts down while the reader shows a document; the server's figure wins on every report.
  const easyReadTimer = useEasyReadTimer({ allowance, running: contentReady });
  const [simplifiedBlocked, setSimplifiedBlocked] = useState(false);
  const blockedByServer = isEasyReadLimitError(urlError) || simplifiedBlocked;
  const outOfTime = noTimeAtOpen || easyReadTimer.outOfTime || blockedByServer;
  const {
    simplified,
    limitReached: simplifiedLimitReached,
    retry: retrySimplified,
  } = useSimplifiedPages({
    documentId,
    enabled: !skipContent && !outOfTime,
    priorityRef: readingPageRef,
  });
  useEffect(() => {
    if (simplifiedLimitReached) setSimplifiedBlocked(true);
  }, [simplifiedLimitReached]);
  const [isAllowanceBannerOpen, setIsAllowanceBannerOpen] = useState(true);
  const showBanner =
    easyReadTimer.limited && !outOfTime && isAllowanceBannerOpen && easyReadTimer.remaining !== null;
  const timePill =
    easyReadTimer.limited && !outOfTime && easyReadTimer.remaining !== null ? (
      <EasyReadTimePill remaining={easyReadTimer.remaining} />
    ) : null;

  const hasError = !isLoading && !outOfTime && urlFetchError;

  return (
    <>
      {outOfTime && (
        <Modal>
          <EasyReadLimitDialog
            resetsOn={allowance?.resetsOn}
            secondaryLabel="Back to document"
            onSecondary={() => router.push(backHref)}
          />
        </Modal>
      )}
      {isEasyReadHighlightModal && !outOfTime && (
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
      <AppLayoutV2 variant="reader" noPadding={true}>
        <div
          className="relative flex h-[100dvh] flex-col bg-sunken md:h-auto md:min-h-0 md:flex-1"
          data-selection-dock=""
        >
          <ReaderChrome
            backHref={backHref}
            documentTitle={documentTitle}
            mode={viewMode}
            onModeChange={setMode}
            settings={{ ...readingSettings, originalScale }}
            timePill={timePill}
          />

          {showBanner && (
            <EasyReadAllowanceBanner
              remaining={easyReadTimer.remaining ?? 0}
              onDismiss={() => setIsAllowanceBannerOpen(false)}
            />
          )}

          {/* Phones have no reader bar: the time left floats at the top once the banner is closed. */}
          {timePill && !showBanner && (
            <div className="pointer-events-none fixed right-3 top-3 z-30 md:hidden">
              {timePill}
            </div>
          )}

          {contentReady && originalFileUrl && (
            // Time up mid-read: the page stays behind the upgrade prompt, blurred and inert.
            <div
              className={cn("flex min-h-0 flex-1 flex-col", {
                "pointer-events-none select-none blur-[6px]": outOfTime,
              })}
              aria-hidden={outOfTime || undefined}
            >
              <PDFReader
                originalFileUrl={originalFileUrl.modifiedFile}
                simplified={simplified}
                onRetrySimplified={retrySimplified}
                onPageChange={handlePageChange}
                mode={viewMode}
                scrollMode={readingSettings.scrollMode}
                textSize={readingSettings.textSize}
                fit={readingSettings.fit}
                zoom={readingSettings.zoom}
                onScaleChange={setOriginalScale}
                topicsOpen={readingSettings.topicsOpen}
                onTopicsOpenChange={(open) =>
                  readingSettings.update({ topicsOpen: open })
                }
              />
            </div>
          )}

          {isLoading && !outOfTime ? (
            <div className="flex flex-1 items-center justify-center px-4 pb-24">
              <LoadingReader />
            </div>
          ) : null}

          {hasError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-24">
              <ErrorMessage message="Something went wrong while loading your file" />
              <Button
                title="Retry"
                size="small"
                onClick={() => {
                  refetchUrl();
                }}
              />
            </div>
          ) : null}

          <ReaderDock
            backHref={backHref}
            mode={viewMode}
            onModeChange={setMode}
            topics={topicsSummary}
            onOpenTopics={() => setIsTopicsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <TopicsSheet
            isOpen={isTopicsOpen}
            onClose={() => setIsTopicsOpen(false)}
          />
          <ReadingSettingsSheet
            {...readingSettings}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      </AppLayoutV2>
    </>
  );
};

export default EasyRead;

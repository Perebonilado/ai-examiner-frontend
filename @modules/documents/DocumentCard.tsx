import { AllDocumentsModel } from "@/models/document.model";
import React, { ElementRef, FC, useEffect, useState } from "react";
import * as moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import { useModalContext } from "@/contexts/ModalContext";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import {
  useGetFileThumbnailDetailsQuery,
  useUpdateDocumentMutation,
} from "@/api-services/document.service";
import { toast } from "react-toastify";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import MoreActionsDefaultView from "./MoreActionsDefaultView";
import EditDocumentForm from "./EditDocumentForm";
import useClickOutside from "@/hooks/useClickOutside";
import { EllipsisVertical, FileText } from "lucide-react";
import cn from "classnames";
import { FILE_KIND_ICON, FILE_KIND_NAME, getFileKindFromUrl } from "./fileKind";

interface Props extends AllDocumentsModel {}

type ThumbShape = "page" | "slide" | "photo";

const DocumentCard: FC<Props> = ({ createdAt, id, title }) => {
  const router = useRouter();
  const { setModalContent } = useModalContext();
  const [deleteDocument] = useUpdateDocumentMutation();
  const [editDocument, { isSuccess: editDocumentSuccess }] =
    useUpdateDocumentMutation();
  const [isMoreActions, setIsMoreActions] = useState(false);
  const ref = useClickOutside<ElementRef<"div">>(() => {
    setIsMoreActions(false);
  });

  const { data: storedFile, isLoading: thumbnailLoading } =
    useGetFileThumbnailDetailsQuery({ documentId: id }, { skip: !id });
  const thumbnailUrl = storedFile?.thumbnailUrl || "";
  const fileKind = getFileKindFromUrl(storedFile?.iframUrl);
  const TypeIcon = fileKind ? FILE_KIND_ICON[fileKind] : FileText;
  const typeName = fileKind ? FILE_KIND_NAME[fileKind] : "Document";

  const [thumbShape, setThumbShape] = useState<ThumbShape>("page");
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  useEffect(() => {
    setThumbLoaded(false);
    setThumbFailed(false);
  }, [thumbnailUrl]);

  useEffect(() => {
    if (editDocumentSuccess) {
      toast.success("Successful");
    }
  }, [editDocumentSuccess]);

  const created = moment.utc(createdAt).local();
  const href = `/questions/view-questions/${id}`;
  const showImage = Boolean(thumbnailUrl) && !thumbFailed;
  const showPlaceholder = !showImage && !thumbnailLoading;
  const displayTitle = capitalizeFirstLetterOfEachWord(title);

  const handleView = (viewTitle: "edit" | "delete") => {
    setIsMoreActions(false);
    if (viewTitle === "delete") {
      setModalContent(
        <ConfirmationDialog
          title="Delete document?"
          message="This can't be undone"
          confirmationText="Delete"
          onConfirm={() => {
            deleteDocument({ id, isDeleted: true });
          }}
          onCancel={() => {
            setModalContent(null);
          }}
        />
      );
    } else {
      setModalContent(
        <EditDocumentForm
          documentTitle={title}
          handleSubmit={(title) => {
            editDocument({ id, title, isDeleted: false });
          }}
          handleClose={() => {
            setModalContent(null);
          }}
        />
      );
    }
  };

  return (
    <div className="group relative flex flex-col gap-2.5">
      <div
        className={cn(
          "relative aspect-[4/3] rounded-xl overflow-hidden bg-sunken shadow-[inset_0_0_0_1px_var(--line)]",
          "transition-[box-shadow,transform] duration-200 ease-out-expo",
          "group-hover:-translate-y-0.5 group-hover:shadow-[inset_0_0_0_1px_#d6d4de,0_10px_28px_-14px_rgba(16,12,40,0.22),0_2px_6px_-2px_rgba(16,12,40,0.06)]"
        )}
      >
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (fileKind === "image") setThumbShape("photo");
              else
                setThumbShape(
                  img.naturalWidth > img.naturalHeight ? "slide" : "page"
                );
              setThumbLoaded(true);
            }}
            onError={() => setThumbFailed(true)}
            className={cn("absolute block transition-opacity duration-200", {
              "opacity-0": !thumbLoaded,
              "left-[14%] top-3 w-[72%] h-auto rounded-[2px] shadow-page":
                thumbShape === "page",
              "left-[9%] top-1/2 -translate-y-1/2 w-[82%] h-auto rounded-[3px] shadow-page":
                thumbShape === "slide",
              "inset-0 w-full h-full object-cover": thumbShape === "photo",
            })}
          />
        )}
        {(showPlaceholder || (showImage && !thumbLoaded)) && (
          <div
            aria-hidden
            className="absolute left-[14%] right-[14%] top-3 -bottom-px rounded-t-[2px] bg-surface shadow-page grid place-items-center"
          >
            {showPlaceholder && (
              <TypeIcon
                size={28}
                strokeWidth={1.5}
                className="text-faint/70 -translate-y-1"
              />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_30px] gap-1 items-start px-0.5">
        <div className="min-w-0">
          <h3 className="text-sm max-md:text-[13.5px] leading-[1.35] font-semibold text-ink tracking-[-0.01em] line-clamp-2">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent-bright"
            >
              {displayTitle}
            </Link>
          </h3>
          <p className="flex items-center gap-1.5 mt-1 text-xs text-muted tabular-nums">
            <TypeIcon
              size={14}
              strokeWidth={1.6}
              className="flex-shrink-0 text-faint"
              aria-label={typeName}
              role="img"
            />
            <span className="max-md:hidden">
              Created {created.format("MMM D, h:mma")}
            </span>
            <span className="md:hidden">{created.format("MMM D")}</span>
          </p>
        </div>

        <div
          ref={ref}
          className="relative z-[2] -mt-1"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsMoreActions(false);
          }}
        >
          <button
            type="button"
            aria-label={`More actions for ${displayTitle}`}
            aria-haspopup="menu"
            aria-expanded={isMoreActions}
            className={cn(
              "w-[30px] h-[30px] max-md:w-9 max-md:h-9 max-md:-mr-1.5 grid place-items-center rounded-lg transition-colors",
              {
                "bg-accent-50 text-accent": isMoreActions,
                "text-faint hover:bg-hover hover:text-ink": !isMoreActions,
              }
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreActions(!isMoreActions);
            }}
          >
            <EllipsisVertical size={16} strokeWidth={1.75} aria-hidden />
          </button>
          {isMoreActions && (
            <MoreActionsDefaultView
              className="absolute right-0 top-[calc(100%+4px)] z-10 max-md:min-w-[172px]"
              handleViewPerformanceReport={() => {
                router.push(`/performance-tracking/${id}`);
              }}
              handleView={handleView}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

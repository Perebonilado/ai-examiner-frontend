import { RootState } from "@/config/redux-config";
import React, { FC, PropsWithChildren, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal";
import { useGetWebImageSearchQuery } from "@/api-services/document.service";
import Masonry from "react-masonry-css";
import { ChevronLeft, MessageCircle, X } from "lucide-react";
import cn from "classnames";
import { setImageSearchOpen } from "@/features/imageSearchSlice";
import {
  setImageDescription,
  setIsChatOpen,
} from "@/features/documentChatSlice";
import FileUploadSpinner from "../FileUploadSpinner";
import Button from "../../ui/Button";

const breakpointColumnsObj = {
  default: 3,
  1100: 3,
  700: 2,
  500: 1,
};

const iconButton =
  "grid place-items-center w-9 h-9 max-md:w-10 max-md:h-10 rounded-lg text-muted hover:bg-hover hover:text-ink transition-colors";

/** Visualize: a white panel with a masonry grid of images; picking one opens it large with "Tell me more". */
const ImageSearchContainer: FC<PropsWithChildren> = ({ children }) => {
  const { searchQuery, isImageSearchOpen } = useSelector(
    (state: RootState) => state.imageSearchReducer
  );
  const { documentIdInView: documentId } = useSelector(
    (state: RootState) => state.documentChatReducer
  );
  const { data: images, isFetching } = useGetWebImageSearchQuery(
    {
      documentId,
      query: searchQuery,
    },
    {
      skip: !searchQuery || !documentId || !isImageSearchOpen,
      refetchOnMountOrArgChange: true,
    }
  );
  const [enlargedImage, setEnlargedImage] = useState<string>(
    "/home/features/case study.png"
  );
  const [isViewingGrid, setIsViewingGrid] = useState(true);
  const sliderCN = cn(
    `min-w-full flex h-full transition-transform duration-500 ease-out-expo motion-reduce:transition-none`,
    {
      ["-translate-x-[100%]"]: !isViewingGrid,
    }
  );
  const dispatch = useDispatch();
  return (
    <div>
      {isImageSearchOpen && (
        <Modal>
          <div
            role="dialog"
            aria-label="Images"
            className="relative flex flex-col w-[min(1200px,calc(100vw-32px))] h-[min(880px,calc(100dvh-48px))] max-md:w-[calc(100vw-16px)] max-md:h-[calc(100dvh-80px)] overflow-hidden rounded-2xl border border-edge bg-surface shadow-pop"
          >
            <div className="flex items-center justify-between h-14 shrink-0 px-3">
              {!isViewingGrid ? (
                <button
                  type="button"
                  aria-label="Back to images"
                  className={iconButton}
                  onClick={() => {
                    setIsViewingGrid(true);
                  }}
                >
                  <ChevronLeft size={20} strokeWidth={1.75} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                aria-label="Close"
                className={iconButton}
                onClick={() => {
                  dispatch(setImageSearchOpen(false));
                  setIsViewingGrid(true);
                }}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className={sliderCN}>
                <div className="min-w-full overflow-y-auto no-scrollbar px-4 pb-4 max-md:px-2 max-md:pb-2">
                  {!isFetching ? (
                    <Masonry
                      breakpointCols={breakpointColumnsObj}
                      className="flex gap-3 max-md:gap-2"
                      columnClassName="my-masonry-column"
                    >
                      {images &&
                        images.map((item, idx) => (
                          <button
                            type="button"
                            key={idx}
                            aria-label={`Open image ${idx + 1}`}
                            className="block w-full overflow-hidden rounded-xl border border-line bg-sunken mb-3 max-md:mb-2 transition-shadow hover:shadow-lift"
                            onClick={() => {
                              setEnlargedImage(item.imageUrl);
                              setIsViewingGrid(false);
                            }}
                          >
                            <img
                              src={item.imageUrl}
                              alt={`Image ${idx}`}
                              className="block w-full"
                            />
                          </button>
                        ))}
                    </Masonry>
                  ) : (
                    <div className="flex items-center justify-center pt-20">
                      <FileUploadSpinner showIcon={false} />
                    </div>
                  )}
                </div>
                <div className="relative min-w-full h-full px-4 pb-4 max-md:px-2 max-md:pb-2">
                  <div className="relative h-full rounded-xl bg-sunken overflow-hidden">
                    <img
                      src={enlargedImage}
                      alt={`enlarged image`}
                      className="w-full h-full object-contain p-4 pb-20"
                    />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <Button
                      title="Tell me more"
                      size="large"
                      className="shadow-lift"
                      starticon={<MessageCircle size={18} strokeWidth={1.75} />}
                      onClick={() => {
                        dispatch(
                          setImageDescription({
                            image: enlargedImage,
                            searchPhrase: searchQuery,
                          })
                        );

                        setTimeout(() => {
                          dispatch(setIsChatOpen(true));
                        }, 300);
                      }}
                    />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {children}
    </div>
  );
};

export default ImageSearchContainer;

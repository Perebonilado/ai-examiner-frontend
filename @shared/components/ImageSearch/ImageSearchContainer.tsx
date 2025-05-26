import { RootState } from "@/config/redux-config";
import React, { FC, PropsWithChildren, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal";
import { useGetWebImageSearchQuery } from "@/api-services/document.service";
import Masonry from "react-masonry-css";
import CloseIcon from "@/icons/CloseIcon";
import ChevronLeft from "@/icons/ChevronLeft";
import cn from "classnames";
import { setImageSearchOpen } from "@/features/imageSearchSlice";
import {
  setImageDescription,
  setIsChatOpen,
} from "@/features/documentChatSlice";
import FileUploadSpinner from "../FileUploadSpinner";

const breakpointColumnsObj = {
  default: 3,
  1100: 3,
  700: 2,
  500: 1,
};

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
    `min-w-full flex  h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`,
    {
      ["-translate-x-[100%]"]: !isViewingGrid,
    }
  );
  const dispatch = useDispatch();
  return (
    <div>
      {isImageSearchOpen && (
        <Modal>
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg w-[97vw] max-w-[1200px] h-[95vh] max-sm:!-translate-y-[30px] max-sm:h-[80vh] relative">
            <div className="flex items-center justify-between min-w-full top-1 absolute px-4 !z-[3000]">
              {!isViewingGrid ? (
                <button
                  className="border bg-white p-[0px] rounded-full shadow-md"
                  onClick={() => {
                    setIsViewingGrid(true);
                  }}
                >
                  <ChevronLeft />
                </button>
              ) : (
                <span className=" p-[5px]"></span>
              )}
              <button
                className="border bg-white p-[5px] rounded-full shadow-md"
                onClick={() => {
                  dispatch(setImageSearchOpen(false));
                  setIsViewingGrid(true);
                }}
              >
                <CloseIcon fill="#000000000" />
              </button>
            </div>
            <div className={sliderCN}>
              <div className="min-w-full overflow-y-auto no-scrollbar">
                {!isFetching ? (
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="flex gap-4"
                    columnClassName="my-masonry-column"
                  >
                    {images &&
                      images.map((item, idx) => (
                        <div className="w-full overflow-hidden bg-white rounded-lg mb-4">
                          <img
                            key={idx}
                            src={item.imageUrl}
                            alt={`Image ${idx}`}
                            className="w-full cursor-pointer"
                            onClick={() => {
                              setEnlargedImage(item.imageUrl);
                              setIsViewingGrid(false);
                            }}
                          />
                        </div>
                      ))}
                  </Masonry>
                ) : (
                  <div className="flex items-center justify-center pt-20">
                    <FileUploadSpinner showIcon={false} />
                  </div>
                )}
              </div>
              <div className="min-w-full h-full relative pb-24 pt-6">
                <button
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-3 border border-[#9A67E2] bg-[#9A67E2] rounded-[60px] px-6 py-3 text-white text-sm flex items-center"
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
                >
                  Tell me more
                </button>
                <img
                  src={enlargedImage}
                  alt={`enlarged image`}
                  className="w-full h-full object-contain"
                />
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

const data = [
  {
    imageUrl:
      "https://www.physio-pedia.com/images/thumb/7/7e/RA_Hand_1.png/300px-RA_Hand_1.png",
    title: "Hand Rheumatoid Arthritis - Physiopedia",
  },
  {
    imageUrl:
      "https://www.3pointproducts.com/hubfs/2-Jan-04-2023-05-49-16-9561-PM.png",
    title: "How to Manage a Thumb Deformity from Rheumatoid Arthritis",
  },
  {
    imageUrl:
      "https://i0.wp.com/post.healthline.com/wp-content/uploads/2021/01/Swan-neck-deformity-1296x728-slide2.jpg?w=1155&h=1528",
    title: "Rheumatoid Arthritis Hand Deformities: What to Do",
  },
  {
    imageUrl:
      "https://media.springernature.com/lw1200/springer-static/image/art%3A10.1186%2Fs13075-021-02448-4/MediaObjects/13075_2021_2448_Fig4_HTML.png",
    title:
      "Comprehensive assessment of alterations in hand deformities over ...",
  },
  {
    imageUrl:
      "https://i0.wp.com/post.healthline.com/wp-content/uploads/2021/01/Boutonniere-deformity-1296x728-slide1.jpg?w=1155&h=1528",
    title: "Rheumatoid Arthritis Hand Deformities: What to Do",
  },
  {
    imageUrl:
      "https://img.grepmed.com/uploads/5332/arthritis-rheumatology-diagnosis-types-forms-original.jpeg",
    title:
      "Common Forms of Arthritis in the Hands Acute Rheumatoid ... | GrepMed",
  },
  {
    imageUrl:
      "https://www.versusarthritis.org/media/1511/hand-deformities-caused-by-rheumatoid-arthritis-780.jpg?width=396.3414634146342&height=500",
    title:
      "Joint care | Rheumatoid Arthritis (RA) support program - homepage ...",
  },
  {
    imageUrl:
      "https://www.researchgate.net/publication/349665256/figure/fig4/AS:996070645579794@1614493156333/Paths-of-rheumatoid-hand-development-From-the-onset-of-rheumatoid-arthritis-patterns.png",
    title:
      "Paths of rheumatoid hand development. From the onset of rheumatoid ...",
  },
  {
    imageUrl:
      "https://images.ctfassets.net/yixw23k2v6vo/2OyU6z2HCPGr6X6pAsvDgl/a8976002548d3eef4bf433424db1d804/rheumatoid-arthritis-hands-1-3000x2000.jpg",
    title: "Rheumatoid Arthritis Hands: Symptoms, Causes and Treatment",
  },
  {
    imageUrl:
      "https://upload.orthobullets.com/topic/9085/images/077cc28d-fbf1-4e2b-9f20-fa57bd4a1b40_ulnar_drift..jpg",
    title: "Rheumatoid Arthritis - Basic Science - Orthobullets",
  },
];

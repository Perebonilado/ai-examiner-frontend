import CloseIcon from "@/icons/CloseIcon";
import React, { FC } from "react";

interface Props {
  videoId: string;
  handleClose: () => void;
}

const RelatedVideoPlayer: FC<Props> = ({ videoId, handleClose }) => {
  return (
    <div className="p-6 rounded-2xl bg-white w-[95vw] max-w-5xl mx-auto relative">
      <button className="absolute top-2 right-3" onClick={handleClose}>
        <CloseIcon />
      </button>
      <div className="w-full aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default RelatedVideoPlayer;

import { YoutubeRelatedVideoModel } from "@/models/youtube.model";
import React, { FC } from "react";
import YoutubeThumbnail from "./YoutubeThumbnail";

interface Props {
  data: YoutubeRelatedVideoModel[];
  handlePlay: (title: string) => void;
}

const RelatedVideosContainer: FC<Props> = ({ data, handlePlay }) => {
  return (
    <div className="grid grid-cols-2 gap-12 justify-self-start max-sm:grid-cols-1 max-sm:justify-self-center">
      {data.map((d) => {
        return (
          <YoutubeThumbnail
            {...d}
            key={d.videoId}
            handlePlay={(title) => {
              handlePlay(title);
            }}
          />
        );
      })}
    </div>
  );
};

export default RelatedVideosContainer;

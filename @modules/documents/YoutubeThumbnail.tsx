import { YoutubeRelatedVideoModel } from "@/models/youtube.model";
import Image from "next/image";
import React, { FC } from "react";

interface Props extends YoutubeRelatedVideoModel {
  handlePlay: (id: string) => void;
}

const YoutubeThumbnail: FC<Props> = ({
  channelTitle,
  description,
  thumbnail,
  title,
  videoId,
  handlePlay,
}) => {
  return (
    <div
      onClick={() => {
        handlePlay(videoId);
      }}
      className="cursor-pointer group transition-all duration-300 hover:translate-y-1 hover:shadow-lg"
    >
      {/* Thumbnail container with overlay */}
      <div className="overflow-hidden shadow-md relative w-full h-[180px] border border-gray-200 rounded-2xl group-hover:shadow-xl transition-all duration-300">
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#360B58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </div>
        </div>
        
        {/* Image */}
        <Image
          src={thumbnail}
          alt={title}
          fill
          placeholder="blur"
          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {/* Content */}
      <div className="mt-3 px-1">
        <h3 className="text-base font-semibold w-full max-w-[350px] text-gray-800 line-clamp-2 group-hover:text-[#360B58] transition-colors duration-300">{title}</h3>
        <div className="flex items-center mt-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-2">
            {channelTitle.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-gray-500">{channelTitle}</p>
        </div>
        <p className="text-xs w-full max-w-[350px] text-gray-400 mt-1 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default YoutubeThumbnail;
export interface YouTubeVideoItemDTO {
  videoId: string;
  thumbnail: string;
  title: string;
  author: {
    profile: string;
    name: string;
  };
  viewCount: string;
  duration: string;
  published: string;
  description: string;
}

export interface YouTubeThumbnailDTO {
  url: string;
  width: number;
  height: number;
}

export interface GetRelatedYoutubeVideosQuery {
  documentId: string;
}

export interface YoutubeRelatedVideoModel {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
}

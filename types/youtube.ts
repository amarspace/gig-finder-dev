export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
}

export interface YouTubePlaylistItem {
  id: string;
  title: string;
  videoId: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export interface ExtractedArtist {
  name: string;
  count: number; // Number of tracks by this artist
}

export interface YouTubeApiResponse<T> {
  items: T[];
  nextPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

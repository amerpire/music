export interface SongYoutube {
  author: string;
  channel_id: string;
  time: string;
  thumbnail: string;
  title: string;
  video_id: string;
  view_count: string;

  /** Internal properties. */
  path?: string;
  downloaded?: boolean;
}

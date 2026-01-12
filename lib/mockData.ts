/**
 * Mock data for development when YouTube API quota is exceeded
 */

import { YouTubePlaylist, YouTubePlaylistItem } from '@/types/youtube';

export const MOCK_PLAYLISTS: YouTubePlaylist[] = [
  {
    id: 'PLmock1',
    title: 'Techno & Afrohouse Mix',
    description: 'Best underground techno and afrohouse tracks',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    itemCount: 45,
  },
  {
    id: 'PLmock2',
    title: 'Deep House Sessions',
    description: 'Smooth deep house vibes',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    itemCount: 32,
  },
  {
    id: 'PLmock3',
    title: 'Hip-Hop Classics',
    description: 'Golden era hip-hop and modern rap',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    itemCount: 28,
  },
  {
    id: 'PLmock4',
    title: 'Electronic Festival Bangers',
    description: 'EDM, dubstep, and festival anthems',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    itemCount: 50,
  },
  {
    id: 'PLmock5',
    title: 'Chill Beats to Study',
    description: 'Lo-fi and ambient music',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    itemCount: 60,
  },
];

export const MOCK_PLAYLIST_ITEMS: Record<string, YouTubePlaylistItem[]> = {
  PLmock1: [
    {
      id: 'item1',
      title: 'Amelie Lens - Techno DJ Mix',
      videoId: 'vid1',
      channelTitle: 'Amelie Lens',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'item2',
      title: 'Black Coffee - Afrohouse Set',
      videoId: 'vid2',
      channelTitle: 'Black Coffee',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'item3',
      title: 'Tale Of Us - Melodic Techno Mix',
      videoId: 'vid3',
      channelTitle: 'Tale Of Us',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
  ],
  PLmock2: [
    {
      id: 'item4',
      title: 'Disclosure - Deep House Live Set',
      videoId: 'vid4',
      channelTitle: 'Disclosure',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'item5',
      title: 'Duke Dumont - House Mix',
      videoId: 'vid5',
      channelTitle: 'Duke Dumont',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
  ],
  PLmock3: [
    {
      id: 'item6',
      title: 'Kendrick Lamar - HUMBLE. (Official Video)',
      videoId: 'vid6',
      channelTitle: 'Kendrick Lamar',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'item7',
      title: 'J. Cole - No Role Modelz',
      videoId: 'vid7',
      channelTitle: 'J. Cole',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
  ],
  PLmock4: [
    {
      id: 'item8',
      title: 'Martin Garrix - Animals (Official Video)',
      videoId: 'vid8',
      channelTitle: 'Martin Garrix',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'item9',
      title: 'Skrillex - Bangarang ft. Sirah',
      videoId: 'vid9',
      channelTitle: 'Skrillex',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
  ],
  PLmock5: [
    {
      id: 'item10',
      title: 'Lofi Hip Hop Radio - Beats to Study/Relax to',
      videoId: 'vid10',
      channelTitle: 'ChilledCow',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
  ],
};

export type ShowcaseItem = {
  id: string
  name: string
  tags: string[]
  type: 'vocal' | 'instrumental'
  audio: string
  cover: string
}

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'bounce-pulse',
    name: 'Bounce Pulse',
    tags: ['Hip-Hop', 'Pop', 'Energetic', 'TikTok'],
    type: 'vocal',
    audio: '/music/vocal/Bounce-Pulse.flac',
    cover: '/music/vocal/Bounce-Pulse.png',
  },
  {
    id: 'echo-of-us',
    name: 'Echo of Us',
    tags: ['Pop', 'Romantic', 'Emotional', 'Love'],
    type: 'vocal',
    audio: '/music/vocal/Echo-of-Us.flac',
    cover: '/music/vocal/Echo-of-Us.png',
  },
  {
    id: 'disk-dusk',
    name: 'Disk Dusk',
    tags: ['Pop', 'Night', 'Chill', 'Cinematic'],
    type: 'vocal',
    audio: '/music/vocal/Disk-Dusk.flac',
    cover: '/music/vocal/Disk-Dusk.png',
  },
  {
    id: 'late-night-coffee',
    name: 'Late Night Coffee',
    tags: ['Lo-fi', 'Chill', 'Night', 'Study'],
    type: 'instrumental',
    audio: '/music/instrumental/Late-Night-Coffee.flac',
    cover: '/music/instrumental/Late-Night-Coffee.png',
  },
  {
    id: 'rise-pulse',
    name: 'Rise Pulse',
    tags: ['Electronic', 'EDM', 'Energetic', 'Festival'],
    type: 'instrumental',
    audio: '/music/instrumental/Rise-Pulse.flac',
    cover: '/music/instrumental/Rise-Pulse.png',
  },
  {
    id: 'dawn-darkness',
    name: 'Dawn Darkness',
    tags: ['Cinematic', 'Ambient', 'Emotional', 'Trailer'],
    type: 'instrumental',
    audio: '/music/instrumental/Dawn-Darkness.flac',
    cover: '/music/instrumental/Dawn-Darkness.png',
  },
]
